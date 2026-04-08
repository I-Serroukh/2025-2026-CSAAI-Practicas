const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;


// IMÁGENES
const shipImg = new Image();
shipImg.src = "img/nave.png";

const alienImg = new Image();
alienImg.src = "img/alien.png";

const backgroundImg = new Image();
backgroundImg.src = "img/fondo.jpg";

const explosionImg = new Image();
explosionImg.src = "img/explosion.png";


// SONIDOS
const shootSound = new Audio("sounds/disparo.mp3");
const explosionSound = new Audio("sounds/explosion.mp3");
const hitSound = new Audio("sounds/hit.mp3");
const victorySound = new Audio("sounds/victoria.mp3");
const gameOverSound = new Audio("sounds/gameover.mp3");


// UI
const overlay = document.getElementById("overlay");
const gameMessage = document.getElementById("gameMessage");
const energyFill = document.getElementById("energyFill");

let gameOver = false;


// JUGADOR
const player = {
	x: canvas.width / 2 - 30,
	y: canvas.height - 80,
	width: 60,
	height: 60,
	speed: 5,
	lives: 3,
	energy: 5,
	maxEnergy: 5,
	lastShot: 0
};


// CONTROLES
const keys = {};
document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);


// DISPAROS
let bullets = [];
let enemyBullets = [];
let explosions = [];


// ALIENS
let aliens = [];
let score = 0;


// CREAR ALIENS
function createAliens(){
	for(let row = 0; row < 3; row++){
		for(let col = 0; col < 8; col++){
			aliens.push({
				x: 100 + col * 70,
				y: 50 + row * 60,
				width: 50,
				height: 40
			});
		}
	}
}
createAliens();


// MOVIMIENTO JUGADOR
function movePlayer(){

	if(keys["ArrowLeft"] && player.x > 0){
		player.x -= player.speed;
	}

	if(keys["ArrowRight"] && player.x < canvas.width - player.width){
		player.x += player.speed;
	}

}


// DISPARO
function shoot(){

	let now = Date.now();

	if(keys["Space"] && player.energy > 0 && now - player.lastShot > 200){

		bullets.push({
			x: player.x + player.width / 2,
			y: player.y,
			width: 3,
			height: 10
		});

		player.energy--;
		player.lastShot = now;

		shootSound.currentTime = 0;
		shootSound.play();
	}

}


// RECARGA
setInterval(() => {

	if(player.energy < player.maxEnergy && !gameOver){
		player.energy++;
	}

}, 500);


// MOVIMIENTO DISPAROS
function moveBullets(){

	bullets = bullets.filter(b => b.y > 0);
	enemyBullets = enemyBullets.filter(b => b.y < canvas.height);

	bullets.forEach(b => b.y -= 6);
	enemyBullets.forEach(b => b.y += 4);

}


// MOVIMIENTO ALIENS
let direction = 1;

function moveAliens(){

	if(aliens.length === 0) return;

	let speed = 1 + (24 - aliens.length) * 0.15;
	let change = false;

	for(let i = 0; i < aliens.length; i++){

		let alien = aliens[i];

		alien.x += speed * direction;

		if(alien.x <= 0 || alien.x >= canvas.width - alien.width){
			change = true;
		}

	}

	if(change){

		direction *= -1;

		for(let i = 0; i < aliens.length; i++){
			aliens[i].y += 20;
		}

	}

}


// DISPARO ENEMIGO
setInterval(() => {

	if(gameOver) return;

	if(aliens.length > 0){

		let alien = aliens[Math.floor(Math.random() * aliens.length)];

		enemyBullets.push({
			x: alien.x + 20,
			y: alien.y,
			width: 3,
			height: 10
		});

	}

}, 900);


// COLISIÓN
function isColliding(a, b){

	return (
		a.x < b.x + b.width &&
		a.x + a.width > b.x &&
		a.y < b.y + b.height &&
		a.y + a.height > b.y
	);

}


// COLISIONES
function collisions(){

	for(let i = bullets.length - 1; i >= 0; i--){

		let bullet = bullets[i];

		for(let j = aliens.length - 1; j >= 0; j--){

			let alien = aliens[j];

			if(isColliding(bullet, alien)){

				explosions.push({
					x: alien.x,
					y: alien.y,
					frame: 0
				});

				explosionSound.currentTime = 0;
				explosionSound.play();

				bullets.splice(i, 1);
				aliens.splice(j, 1);

				score += 10;

				break;
			}
		}
	}

	for(let i = enemyBullets.length - 1; i >= 0; i--){

		let bullet = enemyBullets[i];

		if(isColliding(bullet, player)){

			enemyBullets.splice(i, 1);
			player.lives--;

            hitSound.currentTime = 0;
            hitSound.play();

		}
	}

}


// DIBUJAR
function draw(){

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);

	ctx.drawImage(shipImg, player.x, player.y, player.width, player.height);

	aliens.forEach(a => {
		ctx.drawImage(alienImg, a.x, a.y, a.width, a.height);
	});

	ctx.fillStyle = "#00f7ff";
	bullets.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));

	ctx.fillStyle = "#ff003c";
	enemyBullets.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));

	explosions.forEach((e, i) => {

		ctx.drawImage(explosionImg, e.x, e.y, 50, 50);
		e.frame++;

		if(e.frame > 15){
			explosions.splice(i, 1);
		}

	});

	document.getElementById("score").innerText = "Puntuación: " + score;
	document.getElementById("lives").innerText = "❤️".repeat(player.lives);
	energyFill.style.width = (player.energy / player.maxEnergy) * 100 + "%";

}


// CHECK GAME
function checkGame(){

	if(gameOver) return;

	if(player.lives <= 0){

		gameOver = true;

		gameOverSound.play();

		overlay.classList.remove("hidden");
		gameMessage.innerText = "GAME OVER";
		gameMessage.classList.add("gameover");

	}

	if(aliens.length === 0){

		gameOver = true;

		victorySound.play();

		overlay.classList.remove("hidden");
		gameMessage.innerText = "VICTORIA";
		gameMessage.classList.add("victory");

	}

}


// GAME LOOP
function gameLoop(){

	if(!gameOver){

		movePlayer();
		shoot();
		moveBullets();
		moveAliens();
		collisions();
		checkGame();

	}

	draw();

	requestAnimationFrame(gameLoop);

}

gameLoop();