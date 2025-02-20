function mod(n, m) {
    return ((n % m) + m) % m;
}

let canvas = document.querySelector(".interactCanvas");
let ctx = canvas.getContext("2d");

// TODO: Use animation dictionary to display dynamic tiles, and cause draw to recurse until animation debt cleared

class GridView {
    constructor(scale) {
        this.cornerX = 0; // In cell units
        this.cornerY = 0;
        this.obstacles = new Set(); // List of (x,y) cells representing obstacles
        this.animation = new Map();
        this.animationPending = false;
        this.scale = scale; // Size (in pixels) of one cell
        this.numGridLinesX = Math.floor(canvas.width / this.scale);
        this.numGridLinesY = Math.floor(canvas.height / this.scale);
        this.offsetX = mod(this.cornerX * this.scale, this.scale);
        this.offsetY = mod(this.cornerY * this.scale, this.scale);
    }

    requestDraw() {
        if (!this.animationPending) {
            this.animationPending = true;
            window.requestAnimationFrame(() => {
                this.draw();
                this.animationPending = false;  // Reset after drawing
                if (this.animation.size > 0) {
                    this.requestDraw();  // Keep animating if needed
                }
            });
        }
    }

    draw() {
        ctx.fillStyle = "black";
        ctx.fillRect(0,0,canvas.width,canvas.height);
        for(let i = 0; i < this.numGridLinesX + 2; ++i) {
            for(let j = 0; j < this.numGridLinesY + 2; ++j) {
                let cellX = Math.floor(this.cornerX) + i;
                let cellY = Math.floor(this.cornerY) + j;

                if(this.animation.has(`${cellX},${cellY}`)) {
                    let obj = this.animation.get(`${cellX},${cellY}`);
                    obj.f(obj.frame, cellX, cellY, this);
                    obj.frame++;
                    if(obj.frame > obj.maxFrame) {
                        this.animation.delete(`${cellX},${cellY}`);
                    }
                } else {
                    ctx.fillStyle = this.obstacles.has(`${cellX},${cellY}`)? "red" : "#eeeeee";
                    ctx.beginPath();
                    ctx.roundRect((i + 0.005) * this.scale - this.offsetX, (j + 0.01) * this.scale - this.offsetY, this.scale * 0.98, this.scale * 0.98, this.scale * 0.1);
                    ctx.fill();
                }
            }
        }
    }

    addObstacle(x, y) {
        if (this.obstacles.has(`${x},${y}`)) return;
        this.obstacles.add(`${x},${y}`);
        this.animation.set(`${x},${y}`, {f: flipAnim, frame: 0, maxFrame: 60});
        this.requestDraw();
    }

    translateView(dx, dy, cells = false) {
        this.offsetX = mod(this.cornerX * this.scale + dx, this.scale);
        this.offsetY = mod(this.cornerY * this.scale + dy, this.scale);
        this.cornerX += dx / this.scale;
        this.cornerY += dy / this.scale;
        this.requestDraw();
    }

    scaleView(mouseX, mouseY, dz, cells = false) {
        if (this.scale * dz <= 1000 && this.scale * dz >= 20) {
            let mousePosX = (mouseX / this.scale) + this.cornerX;
            let mousePosY = (mouseY / this.scale) + this.cornerY;
            this.scale *= dz;
            let newMousePosX = (mouseX / this.scale) + this.cornerX;
            let newMousePosY = (mouseY / this.scale) + this.cornerY;
            this.numGridLinesX = Math.floor(canvas.width / this.scale);
            this.numGridLinesY = Math.floor(canvas.height / this.scale);
            this.translateView((mousePosX - newMousePosX) * this.scale, (mousePosY - newMousePosY) * this.scale);
        }
    }

    resizeView() {
        let clientRect = canvas.getBoundingClientRect();
        canvas.height = clientRect.height;
        canvas.width = clientRect.width;
        this.numGridLinesX = Math.floor(canvas.width / this.scale);
        this.numGridLinesY = Math.floor(canvas.height / this.scale);
        this.requestDraw();
    }
}

let gridView = new GridView(100);
gridView.requestDraw();

// Attach resize listener to resize method
gridView.resizeView();
window.addEventListener('resize', () => {gridView.resizeView()});

// Attach mouse movement to the translate method
let mouseX = 0;
let mouseY = 0;
let drag = false;
let rightDrag = false;
canvas.addEventListener('mousedown', (e) => {
    if (e.button == 0) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        drag = true;
    } else if (e.button == 2) {
        e.preventDefault();
        gridView.addObstacle(Math.floor((e.clientX / gridView.scale) + gridView.cornerX), Math.floor((e.clientY / gridView.scale) + gridView.cornerY));
        rightDrag = true;
    }
});
canvas.addEventListener("contextmenu", (e) => e.preventDefault());

canvas.addEventListener('mousemove', (e) => {
    if(drag) {
        gridView.translateView(mouseX - e.clientX, mouseY - e.clientY);
        mouseX = e.clientX;
        mouseY = e.clientY;
    } else if(rightDrag) {
        gridView.addObstacle(Math.floor((e.clientX / gridView.scale) + gridView.cornerX), Math.floor((e.clientY / gridView.scale) + gridView.cornerY));
    }
});
canvas.addEventListener('mouseup', () => {
    drag = false;
    rightDrag = false;
});

// Attach mousewheel to the scale method
canvas.addEventListener('wheel', (e) => {
    gridView.scaleView(e.clientX, e.clientY, 1 - Math.sign(e.deltaY) * 0.05);
});



function flipAnim(frame, cellX, cellY, gridView) {
    let t = frame / 60 - 0.5;
    let x = (cellX - gridView.cornerX) * gridView.scale;
    let y = (cellY - gridView.cornerY) * gridView.scale;
    ctx.fillStyle = (t <= 0)? "#eeeeee" : "red";
    ctx.beginPath();
    ctx.roundRect(x, y + (0.51 - Math.abs(t)) * gridView.scale, 0.98 * gridView.scale, 2 * 0.98 * Math.abs(t) * gridView.scale, gridView.scale * 0.1);
    ctx.fill();
}