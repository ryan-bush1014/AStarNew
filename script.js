function mod(n, m) {
    return ((n % m) + m) % m;
}

let canvas = document.querySelector(".interactCanvas");
let ctx = canvas.getContext("2d");

class GridView {
    constructor(scale) {
        this.cornerX = 0; // In cell units
        this.cornerY = 0;
        this.obstacles = new Set(); // List of (x,y) cells representing obstacles
        this.obstacles.add("0,0");
        this.scale = scale; // Size (in pixels) of one cell
        this.numGridLinesX = Math.floor(canvas.width / this.scale);
        this.numGridLinesY = Math.floor(canvas.height / this.scale);
        this.offsetX = mod(this.cornerX * this.scale, this.scale);
        this.offsetY = mod(this.cornerY * this.scale, this.scale);
    }

    draw() {
        ctx.fillStyle = "black";
        ctx.fillRect(0,0,canvas.width,canvas.height);
        for(let i = 0; i < this.numGridLinesX + 2; ++i) {
            for(let j = 0; j < this.numGridLinesY + 2; ++j) {
                let cellX = Math.floor(this.cornerX) + i;
                let cellY = Math.floor(this.cornerY) + j;

                ctx.fillStyle = this.obstacles.has(`${cellX},${cellY}`)? "red" : "#eeeeee";
                ctx.beginPath();
                ctx.roundRect((i + 0.005) * this.scale - this.offsetX, (j + 0.01) * this.scale - this.offsetY, this.scale * 0.98, this.scale * 0.98, this.scale * 0.1);
                ctx.fill();
            }
        }
    }

    addObstacle(x, y) {
        return null;
    }

    translateView(dx, dy, cells = false) {
        this.offsetX = mod(this.cornerX * this.scale + dx, this.scale);
        this.offsetY = mod(this.cornerY * this.scale + dy, this.scale);
        this.cornerX += dx / this.scale;
        this.cornerY += dy / this.scale;
        this.draw();
    }

    scaleView(mouseX, mouseY, dz, cells = false) {
        if (this.scale * dz <= 1000 && this.scale * dz >= 10) {
            let mousePosX = mouseX + this.cornerX;
            let mousePosY = mouseY + this.cornerY;
            this.scale = this.scale * dz;
            this.numGridLinesX = Math.floor(canvas.width / this.scale);
            this.numGridLinesY = Math.floor(canvas.height / this.scale);
            this.translateView(mousePosX * (dz - 1), mousePosY * (dz - 1));
        }
    }

    resizeView() {
        let clientRect = canvas.getBoundingClientRect();
        canvas.height = clientRect.height;
        canvas.width = clientRect.width;
        this.numGridLinesX = Math.floor(canvas.width / this.scale);
        this.numGridLinesY = Math.floor(canvas.height / this.scale);
        this.draw();
    }
}

let gridView = new GridView(100);
gridView.draw();

// Attach resize listener to resize method
gridView.resizeView();
window.addEventListener('resize', () => {gridView.resizeView()});

// Attach mouse movement to the translate method
let mouseX = 0;
let mouseY = 0;
let drag = false;
canvas.addEventListener('mousedown', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    drag = true;
});
canvas.addEventListener('mousemove', (e) => {
    if(drag) {
        gridView.translateView(mouseX - e.clientX, mouseY - e.clientY);
        mouseX = e.clientX;
        mouseY = e.clientY;
    }
});
canvas.addEventListener('mouseup', () => {drag = false;});

canvas.addEventListener('wheel', (e) => {
    gridView.scaleView(e.clientX, e.clientY, 1 - Math.sign(e.deltaY) * 0.05);
})