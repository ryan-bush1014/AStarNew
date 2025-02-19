let canvas = document.querySelector(".interactCanvas");
let ctx = canvas.getContext("2d");

class GridView {
    constructor(scale) {
        this.cornerX = 0; // In cell units
        this.cornerY = 0;
        this.obstacles = []; // List of (x,y) cells representing obstacles
        this.scale = scale; // Size (in pixels) of one cell
        this.numGridLinesX = Math.floor(canvas.width / this.scale);
        this.numGridLinesY = Math.floor(canvas.width / this.scale);
        this.offsetX = (this.cornerX * this.scale) % this.scale;
        this.offsetY = (this.cornerY * this.scale) % this.scale;
    }

    draw() {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        for(let i = 0; i < this.numGridLinesX + 2; ++i) {
            ctx.fillRect((i - 0.005) * this.scale - this.offsetX, 0, this.scale * 0.01, canvas.height);
        }
        for(let j = 0; j < this.numGridLinesY + 2; ++j) {
            ctx.fillRect(0, j * this.scale - this.offsetY, canvas.width, this.scale * 0.01);
        }
    }

    addObstacle(x, y) {
        return null;
    }

    translateView(dx, dy, cells = false) {
        this.cornerX += dx / this.scale;
        this.cornerY += dy / this.scale;
        this.offsetX = (this.offsetX + dx) % this.scale;
        this.offsetY = (this.offsetY + dy) % this.scale;
        this.draw();
    }

    scaleView(mouseX, mouseY, cells = false) {
        return null;
    }

    resizeView() {
        let clientRect = canvas.getBoundingClientRect();
        canvas.height = clientRect.height;
        canvas.width = clientRect.width;
        this.numGridLinesX = Math.floor(canvas.width / this.scale);
        this.numGridLinesY = Math.floor(canvas.width / this.scale);
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