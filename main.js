const game_canvas = document.getElementById('game');
const context = game_canvas.getContext('2d');

// Variables
let score;
let highscore;
let player;
let gravity;
let obstacles;
let gameSpeed;
let keys = {};

// Event liesteners
document.addEventListener('keydown', function (evt) {
    keys[evt.code] = true;
});

document.addEventListener('keyup', function (evt) {
    keys[evt.code] = false;
    console.log(keys);
});

class Player {
    constructor(x, y, w, h, c) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.c = c;

        this.dy = 0
        this.jumpForce = 10;
        this.originalHeight = h;
        this.grounded = false;

    }

    Animate() {
        // Jump
        if (keys['Space'] || keys['KeyW'])
            this.Jump();
        else
            this.jumpTimer = 0;

        this.y += this.dy;
        // Gravity
        if (this.y + this.h < game_canvas.height) {
            this.dy += gravity;
            this.grounded = false;
        } else {
            this.dy = 0;
            this.grounded = true;
            this.y = game_canvas.height - this.h;
        }


        this.Draw()
    }

    Draw() {
        context.beginPath();
        context.fillStyle = this.c;
        context.fillRect(this.x, this.y, this.w, this.h);
        context.closePath();
    }

    Jump() {
        if (this.grounded && this.jumpTimer === 0) {
            this.jumpTimer = 1;
            this.dy = -this.jumpForce;
        } else if (this.jumpTimer > 0 && this.jumpTimer < 15) {
            this.jumpTimer++;
            this.dy = -this.jumpForce - (this.jumpTimer / 50);
        }
    }

}

function Start() {
    //game_canvas.width = window.innerWidth;
    //game_canvas.height = window.innerHeight;

    context.font = "20px sans-serif";

    gameSpeed = 3;
    gravity = 1;
    score = 0;
    highscore = 0;

    player = new Player(25, game_canvas.height - 150, 50, 50, '#1d43b7');

    requestAnimationFrame(Update);

}

function Update() {
    requestAnimationFrame(Update);
    context.clearRect(0, 0, game_canvas.width, game_canvas.height);

    player.Animate();
}

Start();
