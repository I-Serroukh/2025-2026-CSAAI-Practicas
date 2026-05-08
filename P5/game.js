/* jshint esversion: 6 */

// game.js

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// =======================
// UI
// =======================

const menuScreen = document.getElementById("menuScreen");
const countdownEl = document.getElementById("countdown");
const messageEl = document.getElementById("message");
const gameOverEl = document.getElementById("gameOver");
const finalText = document.getElementById("finalText");

const playerScoreEl = document.getElementById("playerScore");
const botScoreEl = document.getElementById("botScore");

const modeLabel = document.getElementById("modeLabel");
const difficultyLabel = document.getElementById("difficultyLabel");
const timerEl = document.getElementById("timer");

const restartBtn = document.getElementById("restartBtn");
const menuBtn = document.getElementById("menuBtn");

const kickSound = new Audio("assets/kick.mp3");
const goalSound = new Audio("assets/goal.mp3");
const whistleSound = new Audio("assets/whistle.mp3");

kickSound.volume = 0.4;
goalSound.volume = 0.5;
whistleSound.volume = 0.6;

// =======================
// ESTADO DEL JUEGO
// =======================

let gameMode = "3goals";
let gameRunning = false;
let countdownActive = false;

let playerScore = 0;
let botScore = 0;

let difficulty = "normal";

let gameTime = 180;
let timerInterval = null;

const goalHeight = 180;

// =======================
// JUGADOR
// =======================

const player = {
    x: 200,
    y: HEIGHT / 2,
    radius: 25,
    color: "#153b8a",
    speed: 4,
    angle: 0
};

// =======================
// BOTS
// =======================

const bots = [
    {
        x: 720,
        y: 220,
        radius: 24,
        color: "#7d1515",
        speed: 3.2,
        role: "attacker",
        lastKick: 0
    },

    {
        x: 850,
        y: 380,
        radius: 24,
        color: "#991111",
        speed: 2.4,
        role: "defender",
        lastKick: 0
    }
];

// =======================
// PELOTA
// =======================

const ball = {
    x: WIDTH / 2,
    y: HEIGHT / 2,
    radius: 12,
    vx: 0,
    vy: 0
};

// =======================
// CONTROLES
// =======================

const keys = {};

window.addEventListener("keydown", function (e) {
    keys[e.key] = true;

    if (e.key === "1") {
        startGame("3goals");
    }

    if (e.key === "2") {
        startGame("golden");
    }

    if (e.code === "Space") {
        shootBall();
    }
});

window.addEventListener("keyup", function (e) {
    keys[e.key] = false;
});

// =======================
// BOTONES
// =======================

document.querySelectorAll("button[data-mode]").forEach(function (btn) {
    btn.addEventListener("click", function () {
        startGame(btn.dataset.mode);
    });
});

// =======================
// BOTONES DIFICULTAD
// =======================

document
    .querySelectorAll("button[data-difficulty]")
    .forEach(function (btn) {
        btn.addEventListener("click", function () {
            setDifficulty(btn.dataset.difficulty);
        });
    });

restartBtn.addEventListener("click", function () {
    startGame(gameMode);
});

menuBtn.addEventListener("click", function () {
    gameOverEl.classList.add("hidden");
    menuScreen.classList.remove("hidden");
});

// =======================
// INICIAR PARTIDA
// =======================

function startGame(mode) {
    gameMode = mode;

    modeLabel.textContent =
        mode === "3goals" ? "A 3 goles" : "Gol de oro";

    playerScore = 0;
    botScore = 0;

    updateScore();

    gameTime = 180;
    timerEl.textContent = "03:00";

    menuScreen.classList.add("hidden");
    gameOverEl.classList.add("hidden");

    resetPositions();
    startCountdown();
}

// =======================
// DIFICULTAD
// =======================

function setDifficulty(level) {
    difficulty = level;

    if (level === "easy") {
        bots[0].speed = 2.2;
        bots[1].speed = 1.8;
        difficultyLabel.textContent = "Dificultad: Fácil";
    }

    if (level === "normal") {
        bots[0].speed = 3.2;
        bots[1].speed = 2.4;
        difficultyLabel.textContent = "Dificultad: Normal";
    }

    if (level === "hard") {
        bots[0].speed = 4.2;
        bots[1].speed = 3.2;
        difficultyLabel.textContent = "Dificultad: Difícil";
    }
}

// =======================
// CUENTA ATRÁS
// =======================

function startCountdown() {
    countdownActive = true;

    countdownEl.classList.remove("hidden");

    let count = 3;

    countdownEl.textContent = count;

    const interval = setInterval(function () {
        count--;

        if (count > 0) {
            countdownEl.textContent = count;
        } else {
            clearInterval(interval);

            whistleSound.pause();
            whistleSound.currentTime = 0;

            whistleSound.play().catch(function () {});

            countdownEl.classList.add("hidden");

            countdownActive = false;
            gameRunning = true;

            if (!timerInterval) {
                startTimer();
            }
        }
    }, 1000);
}

// =======================
// TIMER
// =======================

function startTimer() {
    clearInterval(timerInterval);

    timerInterval = setInterval(function () {
        if (!gameRunning || countdownActive) {
            return;
        }

        gameTime--;

        const minutes = Math.floor(gameTime / 60)
            .toString()
            .padStart(2, "0");

        const seconds = (gameTime % 60)
            .toString()
            .padStart(2, "0");

        timerEl.textContent = minutes + ":" + seconds;

        if (gameTime <= 0) {
            clearInterval(timerInterval);

            if (playerScore > botScore) {
                endGame(true);
            } else {
                endGame(false);
            }
        }
    }, 1000);
}

// =======================
// UPDATE GENERAL
// =======================

function update() {
    if (!gameRunning || countdownActive) {
        return;
    }

    movePlayer();
    moveBots();
    updateBall();
    checkGoal();
}

// =======================
// MOVIMIENTO JUGADOR
// =======================

function movePlayer() {
    if (keys.ArrowUp) {
        player.y -= player.speed;
    }

    if (keys.ArrowDown) {
        player.y += player.speed;
    }

    if (keys.ArrowLeft) {
        player.x -= player.speed;
    }

    if (keys.ArrowRight) {
        player.x += player.speed;
    }

    if (keys.a || keys.A) {
        player.angle -= 0.08;
    }

    if (keys.d || keys.D) {
        player.angle += 0.08;
    }

    player.x = Math.max(
        player.radius,
        Math.min(WIDTH - player.radius, player.x)
    );

    player.y = Math.max(
        player.radius,
        Math.min(HEIGHT - player.radius, player.y)
    );

    handleCollision(player, 6);
}

// =======================
// IA BOTS
// =======================

function moveBots() {
    bots.forEach(function (bot) {
        let targetX = bot.x;
        let targetY = bot.y;

        if (bot.role === "attacker") {
            targetX = ball.x - 25;
            targetY = ball.y;

            if (ball.x > WIDTH - 220) {
                targetX = ball.x - 80;
            }
        }

        if (bot.role === "defender") {
            targetX = WIDTH - 180;
            targetY = ball.y;

            targetY = Math.max(
                120,
                Math.min(HEIGHT - 120, targetY)
            );

            if (ball.x > WIDTH - 320) {
                targetX = ball.x - 40;
                targetY = ball.y;
            }
        }

        const dx = targetX - bot.x;
        const dy = targetY - bot.y;

        const dist = Math.hypot(dx, dy);

        if (dist > 1) {
            bot.x += (dx / dist) * bot.speed;
            bot.y += (dy / dist) * bot.speed;
        }

        const safeMargin = 35;

        bot.x = Math.max(
            safeMargin,
            Math.min(WIDTH - safeMargin, bot.x)
        );

        bot.y = Math.max(
            safeMargin,
            Math.min(HEIGHT - safeMargin, bot.y)
        );

        const dxBall = ball.x - bot.x;
        const dyBall = ball.y - bot.y;

        const distBall = Math.hypot(dxBall, dyBall);

        const minDist = bot.radius + ball.radius;

        if (
            distBall < minDist + 10 &&
            Date.now() - bot.lastKick > 350
        ) {
            bot.lastKick = Date.now();

            const angle = Math.atan2(dyBall, dxBall);

            const pushBack = 14;

            bot.x -= Math.cos(angle) * pushBack;
            bot.y -= Math.sin(angle) * pushBack;

            const shootPower =
                bot.role === "attacker" ? 6.5 : 5;

            ball.vx = Math.cos(angle) * shootPower - 2.5;
            ball.vy = Math.sin(angle) * shootPower;

            ball.vy += (Math.random() - 0.5) * 2;

            ball.x += ball.vx * 0.5;
            ball.y += ball.vy * 0.5;
        }
    });
}

// =======================
// COLISIONES
// =======================

function handleCollision(entity, force) {
    const dx = ball.x - entity.x;
    const dy = ball.y - entity.y;

    const dist = Math.hypot(dx, dy);

    const minDist = entity.radius + ball.radius;

    if (dist < minDist) {
        const angle = Math.atan2(dy, dx);

        ball.vx = Math.cos(angle) * force;
        ball.vy = Math.sin(angle) * force;
    }
}

// =======================
// CHUT
// =======================

function shootBall() {
    const dx = ball.x - player.x;
    const dy = ball.y - player.y;

    const dist = Math.hypot(dx, dy);

    if (dist < 70) {
        kickSound.pause();
        kickSound.currentTime = 0;

        kickSound.play().catch(function () {});

        ball.vx = Math.cos(player.angle) * 10;
        ball.vy = Math.sin(player.angle) * 10;
    }
}

// =======================
// UPDATE PELOTA
// =======================

function updateBall() {
    ball.x += ball.vx;
    ball.y += ball.vy;

    ball.vx *= 0.985;
    ball.vy *= 0.985;

    if (Math.abs(ball.vx) < 0.05) {
        ball.vx = 0;
    }

    if (Math.abs(ball.vy) < 0.05) {
        ball.vy = 0;
    }

    if (ball.y - ball.radius <= 0) {
        ball.y = ball.radius;
        ball.vy *= -1;
    }

    if (ball.y + ball.radius >= HEIGHT) {
        ball.y = HEIGHT - ball.radius;
        ball.vy *= -1;
    }

    const insideGoal =
        ball.y > HEIGHT / 2 - goalHeight / 2 &&
        ball.y < HEIGHT / 2 + goalHeight / 2;

    if (!insideGoal) {
        ball.x = Math.max(
            ball.radius,
            Math.min(WIDTH - ball.radius, ball.x)
        );
    }

    ball.y = Math.max(
        ball.radius,
        Math.min(HEIGHT - ball.radius, ball.y)
    );
}

// =======================
// GOLES
// =======================

function checkGoal() {
    const insideGoal =
        ball.y > HEIGHT / 2 - goalHeight / 2 &&
        ball.y < HEIGHT / 2 + goalHeight / 2;

    if (!insideGoal) {
        return;
    }

    if (ball.x + ball.radius >= WIDTH) {
        playerScore++;
        scored("¡GOOOOL!");
        return;
    }

    if (ball.x - ball.radius <= 0) {
        botScore++;
        scored("¡Gol rival!");
    }
}

function scored(text) {
    gameRunning = false;

    goalSound.pause();
    goalSound.currentTime = 0;

    goalSound.play().catch(function () {});

    updateScore();
    showMessage(text);

    if (checkWinner()) {
        return;
    }

    setTimeout(function () {
        resetPositions();
        startCountdown();
    }, 1800);
}

// =======================
// MARCADOR
// =======================

function updateScore() {
    playerScoreEl.textContent = playerScore;
    botScoreEl.textContent = botScore;
}

// =======================
// MODOS DE JUEGO
// =======================

function checkWinner() {
    if (gameMode === "3goals") {
        if (playerScore >= 3) {
            endGame(true);
            return true;
        }

        if (botScore >= 3) {
            endGame(false);
            return true;
        }
    } else {
        if (playerScore >= 1) {
            endGame(true);
            return true;
        }

        if (botScore >= 1) {
            endGame(false);
            return true;
        }
    }

    return false;
}

// =======================
// FINAL PARTIDA
// =======================

function endGame(playerWon) {
    gameRunning = false;

    clearInterval(timerInterval);
    timerInterval = null;

    gameOverEl.classList.remove("hidden");

    if (playerWon) {
        finalText.textContent = "¡Has ganado!";
        createConfetti();
    } else {
        finalText.textContent = "Has perdido";
    }
}

// =======================
// RESETEAR
// =======================

function resetPositions() {
    player.x = 200;
    player.y = HEIGHT / 2;
    player.angle = 0;

    bots[0].x = 720;
    bots[0].y = 220;

    bots[1].x = 850;
    bots[1].y = 380;

    ball.x = WIDTH / 2;
    ball.y = HEIGHT / 2;

    ball.vx = 0;
    ball.vy = 0;
}

// =======================
// MENSAJES
// =======================

function showMessage(text) {
    messageEl.textContent = text;

    messageEl.classList.remove("hidden");
    messageEl.classList.add("goal-animation");

    canvas.style.transform = "scale(1.02)";

    setTimeout(function () {
        canvas.style.transform = "scale(1)";

        messageEl.classList.add("hidden");
        messageEl.classList.remove("goal-animation");
    }, 1500);
}

// =======================
// CONFETTI
// =======================

function createConfetti() {
    for (let i = 0; i < 120; i++) {
        const confetti = document.createElement("div");

        confetti.classList.add("confetti");

        confetti.style.left =
            Math.random() * window.innerWidth + "px";

        confetti.style.animationDelay =
            Math.random() * 2 + "s";

        confetti.style.background =
            "hsl(" +
            (Math.random() * 360) +
            ", 100%, 50%)";

        document.body.appendChild(confetti);

        setTimeout(function () {
            confetti.remove();
        }, 4000);
    }
}

// =======================
// DIBUJAR CAMPO
// =======================

function drawField() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    ctx.fillStyle = "#004b11";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.strokeStyle = "rgba(255,255,255,0.6)";
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.moveTo(WIDTH / 2, 0);
    ctx.lineTo(WIDTH / 2, HEIGHT);
    ctx.stroke();

    ctx.beginPath();

    ctx.arc(
        WIDTH / 2,
        HEIGHT / 2,
        60,
        0,
        Math.PI * 2
    );

    ctx.stroke();

    ctx.strokeRect(
        0,
        HEIGHT / 2 - goalHeight / 2,
        90,
        goalHeight
    );

    ctx.strokeRect(
        WIDTH - 90,
        HEIGHT / 2 - goalHeight / 2,
        90,
        goalHeight
    );

    ctx.strokeRect(
        0,
        HEIGHT / 2 - 70,
        30,
        140
    );

    ctx.strokeRect(
        WIDTH - 30,
        HEIGHT / 2 - 70,
        30,
        140
    );
}

// =======================
// DIBUJAR JUGADOR
// =======================

function drawPlayer() {
    ctx.beginPath();

    ctx.fillStyle = "rgba(0,0,0,0.18)";

    ctx.ellipse(
        player.x,
        player.y + 18,
        20,
        8,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.beginPath();

    ctx.fillStyle = player.color;

    ctx.arc(
        player.x,
        player.y,
        player.radius,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.beginPath();

    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(255,255,255,0.75)";

    ctx.arc(
        player.x,
        player.y,
        player.radius + 5,
        0,
        Math.PI * 2
    );

    ctx.stroke();

    const dirX =
        player.x + Math.cos(player.angle) * 40;

    const dirY =
        player.y + Math.sin(player.angle) * 40;

    ctx.beginPath();

    ctx.strokeStyle = "white";
    ctx.lineWidth = 4;

    ctx.moveTo(player.x, player.y);
    ctx.lineTo(dirX, dirY);

    ctx.stroke();
}

// =======================
// DIBUJAR BOTS
// =======================

function drawBots() {
    bots.forEach(function (bot) {
        ctx.beginPath();

        ctx.fillStyle = "rgba(0,0,0,0.18)";

        ctx.ellipse(
            bot.x,
            bot.y + 18,
            20,
            8,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.beginPath();

        ctx.fillStyle = bot.color;

        ctx.arc(
            bot.x,
            bot.y,
            bot.radius,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.beginPath();

        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(255,255,255,0.45)";

        ctx.arc(
            bot.x,
            bot.y,
            bot.radius + 4,
            0,
            Math.PI * 2
        );

        ctx.stroke();
    });
}

// =======================
// DIBUJAR PELOTA
// =======================

function drawBall() {
    ctx.beginPath();

    ctx.fillStyle = "white";

    ctx.arc(
        ball.x,
        ball.y,
        ball.radius,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.strokeStyle = "black";
    ctx.stroke();
}

// =======================
// GAME LOOP
// =======================

function gameLoop() {
    update();

    drawField();
    drawPlayer();
    drawBots();
    drawBall();

    requestAnimationFrame(gameLoop);
}

gameLoop();

setDifficulty("normal");