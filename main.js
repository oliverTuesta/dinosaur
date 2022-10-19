const game_canvas = document.getElementById('game');
const context = game_canvas.getContext('2d');

// Variables
let score;
let scoreText;
let highscore;
let highscoreText;
let player;
let gravity;
let obstacles = [];
let gameSpeed;
let gameSpeedAux;
let keys = {};

// Event liesteners
document.addEventListener('keydown', function (evt) {
    keys[evt.code] = true;
});

document.addEventListener('keyup', function (evt) {
    keys[evt.code] = false;
});

class Obstacle {
    constructor(x, y, w, h, c) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.c = c;

        this.dx = -gameSpeed;
    }

    Update() {
        this.x += this.dx;
        this.Draw();
        this.dx = -gameSpeed;
    }

    Draw() {
        context.beginPath();
        context.fillStyle = this.c;
        context.fillRect(this.x, this.y, this.w, this.h);
        context.closePath();
    }
}

class Player {
    constructor(x, y, w, h, c) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.c = c;

        this.dy = 0;
        this.jumpForce = 10;
        this.originalHeight = h;
        this.grounded = false;
        this.duck = false;
    }

    Animate() {
        // Jump
        if ((keys['Space'] || keys['KeyW'] || keys['ArrowUp']) && !this.duck)
            this.Jump();
        else this.jumpTimer = 0;

        if (keys['ShiftLeft'] || keys['KeyS'] || keys['ArrowDown']) {
            this.h = this.originalHeight / 2;
            this.y += this.h;
            this.duck = true;
        } else {
            this.duck = false;
            this.h = this.originalHeight;
        }
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

        this.Draw();
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
            this.dy = -this.jumpForce - this.jumpTimer / 50;
        }
    }

    MoveRight() {
        if (this.x < game_canvas.width - this.w) this.x += 2;
    }
    MoveLeft() {
        if (this.x > 0) this.x -= 2;
    }

    Respawn() {
        this.x = this.w / 2;
        this.y = game_canvas.height / 2 - this.h / 2;
        this.dy = 0;
        this.grounded = false;
        this.duck = false;
        this.h = this.originalHeight;
    }
}

class Text {
    constructor(t, x, y, a, c, s) {
        this.t = t;
        this.x = x;
        this.y = y;
        this.a = a;
        this.c = c;
        this.s = s;
    }

    Draw() {
        context.beginPath();
        context.fillStyle = this.c;
        context.font = this.s + 'px sans-serif';
        context.textAlign = this.a;
        context.fillText(this.t, this.x, this.y);
        context.closePath();
    }
}

// Game Functions
function SpawnObstacle() {
    let size = RandomIntInRange(20, 50);
    let type = RandomIntInRange(0, 1);
    let obstacle = new Obstacle(
        game_canvas.width + size,
        game_canvas.height - size,
        size,
        size,
        '#e52270'
    );
    if (type == 1) {
        obstacle.y -= player.originalHeight - 10;
    }
    obstacles.push(obstacle);
}

const RandomIntInRange = (min, max) =>
    Math.round(Math.random() * (max - min) + min);

function Start() {
    //game_canvas.width = window.innerWidth;
    //game_canvas.height = window.innerHeight;

    context.font = '20px sans-serif';

    gameSpeed = gameSpeedAux = 3;
    gravity = 1;
    score = 0;
    highscore = 0;
    if (localStorage.getItem('highscore')) {
        highscore = localStorage.getItem('highscore');
    }

    player = new Player(25, 30, 50, 50, '#1d43b7');

    scoreText = new Text('Score: ' + score, 25, 25, 'left', '#212121', '20');
    highscoreText = new Text(
        'Score: ' + highscore,
        game_canvas.width - 25,
        25,
        'right',
        '#212121',
        '20'
    );

    requestAnimationFrame(Update);
}

let initialSpawnTimer = 200;
let spawnTimer = initialSpawnTimer;

function Update() {
    requestAnimationFrame(Update);
    context.clearRect(0, 0, game_canvas.width, game_canvas.height);

    spawnTimer--;
    if (spawnTimer <= 0) {
        SpawnObstacle();
        spawnTimer = initialSpawnTimer - gameSpeed * 8;

        if (spawnTimer < 60) {
            spawnTimer = 60;
        }
    }

    // Spawn Enemies
    for (let i = 0; i < obstacles.length; i++) {
        let o = obstacles[i];
        o.Update();
        if (o.x + o.w <= 0) obstacles.splice(1, i);
        // Colission
        if (
            player.x < o.x + o.w &&
            player.x + player.w > o.x &&
            player.y < o.y + o.h &&
            player.y + player.h > o.y
        ) {
            player.Respawn();
            obstacles = [];
            score = 0;
            spawnTimer = initialSpawnTimer;
            gameSpeed = 1.5;
            window.localStorage.setItem('highscore', highscore);
        }
    }

    score += 0.25;
    highscore = Math.floor(score) > highscore ? score : highscore;
    scoreText.t = 'Score: ' + Math.floor(score);
    scoreText.Draw();
    highscoreText.t = 'Highscore: ' + Math.floor(highscore);
    highscoreText.Draw();
    player.Animate();

    gameSpeedAux += 0.003;
    gameSpeed = gameSpeedAux;
    if (keys['ArrowRight']) {
        player.MoveRight();
        gameSpeed = gameSpeedAux + gameSpeedAux / 8;
    } else if (keys['ArrowLeft']) {
        player.MoveLeft();
        gameSpeed = gameSpeedAux - gameSpeedAux / 4;
    } else {
        gameSpeedAux = gameSpeed;
    }
}

Start();
