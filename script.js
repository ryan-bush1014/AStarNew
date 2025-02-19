let canvas = document.querySelector(".interactCanvas");
let ctx = canvas.getContext("2d");

canvas.resize = () => {
    let clientRect = canvas.getBoundingClientRect();
    canvas.height = clientRect.height;
    canvas.width = clientRect.width;
}

canvas.resize();
document.addEventListener('resize', canvas.resize);


class GridView {
    constructor(scale) {
        this.centerX = 0; // In cell units
        this.centerY = 0;
        this.obstacles = []; // List of (x,y) cells representing obstacles
        this.scale = scale; // Size (in pixels) of one cell
    }

    addObstacle(x, y) {
        return null;
    }

    translateView(dx, dy, cells = false) {
        return null;
    }

    scaleView(centerX, centerY, cells = false) {
        return null;
    }

    draw() {
        return null;
    }

}