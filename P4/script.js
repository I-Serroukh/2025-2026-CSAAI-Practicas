// ELEMENTOS
const grid = document.getElementById("grid");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");

const pairSelect = document.getElementById("pairSelect");
const levelSelect = document.getElementById("levelSelect");

const toggleLabels = document.getElementById("toggleLabels");

const volumeToggle = document.getElementById("volumeToggle");
const volumeSlider = document.getElementById("volumeSlider");

const beatSound = document.getElementById("beatSound");
const music = document.getElementById("music");

const levelSpan = document.getElementById("level");
const timeSpan = document.getElementById("time");
const statusSpan = document.getElementById("status");
const roundSpan = document.getElementById("round");
const wordDisplay = document.getElementById("wordDisplay");

// ESTADO
let cells = [];
let gameRunning = false;
let timer = 0;
let interval;
let musicActive = false;
let currentLevel = 1;

// DATOS
const pairs = {
  casa: { words: ["CASA", "CAMA"], icons: ["🏠", "🛏️"] },
  animales: { words: ["PATO", "GATO"], icons: ["🦆", "🐱"] },
  random1: { words: ["QUESO", "BESO"], icons: ["🧀", "💋"] },
  random2: { words: ["LUNA", "CUNA"], icons: ["🌙", "🛏️"] }
};

// CREAR GRID
for (let i = 0; i < 8; i++) {
  const div = document.createElement("div");
  div.classList.add("cell");
  grid.appendChild(div);
  cells.push(div);
}

// UTILIDADES
function shuffle(a) {
  return [...a].sort(() => Math.random() - 0.5);
}

function getPattern(level) {
  switch (level) {
    case 1: return [0,0,0,0,1,1,1,1];
    case 2: return [0,0,1,1,0,0,1,1];
    case 3: return [0,1,0,1,0,1,0,1];
    case 4: return shuffle([0,0,0,0,1,1,1,1]);
    case 5: return shuffle([0,0,0,0,1,1,1,1]);
  }
}

// GRID
function updateGrid(level) {
  const p = pairs[pairSelect.value];
  const pattern = getPattern(level);

  cells.forEach((c, i) => {
    const idx = pattern[i];

    c.innerHTML = `
      <div class="emoji">${p.icons[idx]}</div>
      <span style="display:${toggleLabels.checked ? 'block' : 'none'}">
        ${p.words[idx]}
      </span>
    `;

    c.dataset.word = p.words[idx];
  });
}

toggleLabels.addEventListener("change", () => {
  updateGrid(currentLevel);
});

// SONIDO
function playBeat(level) {
  beatSound.pause();
  beatSound.currentTime = 0;
  beatSound.playbackRate = 1 + (level * 0.1);
  beatSound.volume = volumeSlider.value;
  beatSound.play();
}

// NIVEL
async function runLevel(level) {
  updateGrid(level);

  const speed = Math.max(300, 1000 - level * 150);

  for (let i = 0; i < 8; i++) {

    if (!gameRunning) return;

    cells.forEach(c => c.classList.remove("active"));
    cells[i].classList.add("active");

    wordDisplay.textContent = cells[i].dataset.word;

    playBeat(level);

    await new Promise(r => setTimeout(r, speed));

    if (!gameRunning) return;
  }
}

// START
async function startGame() {

  if (gameRunning) return;

  gameRunning = true;
  statusSpan.textContent = "Jugando";

  startBtn.disabled = true;
  pairSelect.disabled = true;
  levelSelect.disabled = true;

  if (musicActive) {
    music.volume = volumeSlider.value;
    music.currentTime = 0;
    music.play().catch(() => {});
  }

  timer = 0;

  interval = setInterval(() => {
    timer++;
    timeSpan.textContent = timer + "s";
  }, 1000);

  const startLevel = parseInt(levelSelect.value);

  for (let level = startLevel; level <= 5; level++) {

    if (!gameRunning) break;

    currentLevel = level;

    levelSpan.textContent = level + "/5";
    roundSpan.textContent = level + "/5";

    wordDisplay.textContent = "Preparado...";

    await new Promise(r => setTimeout(r, 1000));

    if (!gameRunning) break;

    await runLevel(level);
  }

  endGame();
}

// STOP
function stopGame() {

  gameRunning = false;

  clearInterval(interval);

  music.pause();
  music.currentTime = 0;

  cells.forEach(c => c.classList.remove("active"));

  statusSpan.textContent = "Detenido";

  startBtn.disabled = false;
  pairSelect.disabled = false;
  levelSelect.disabled = false;

  wordDisplay.textContent = "Pulsa comenzar";
}

// FIN
function endGame() {
  stopGame();
  wordDisplay.textContent = "¡Partida finalizada!";
  statusSpan.textContent = "Finalizado";
}

// CONTROLES
volumeToggle.onclick = () => {

  musicActive = !musicActive;

  if (musicActive) {
    volumeToggle.textContent = "Desactivar música";
    volumeSlider.style.display = "block";
  } else {
    volumeToggle.textContent = "Activar música";
    volumeSlider.style.display = "none";
    music.pause();
  }
};

volumeSlider.oninput = () => {
  music.volume = volumeSlider.value;
};

startBtn.onclick = startGame;
stopBtn.onclick = stopGame;

// INIT
updateGrid(1);