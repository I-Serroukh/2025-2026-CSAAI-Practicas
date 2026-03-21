// ===== SONIDOS =====
const sonidoClick = new Audio("sounds/click.mp3");
const sonidoAcierto = new Audio("sounds/success.mp3");
const sonidoFallo = new Audio("sounds/fail.mp3");
const sonidoVictoria = new Audio("sounds/win.mp3");
const sonidoDerrota = new Audio("sounds/lose.mp3");

// ===== CRONO =====
class Crono {
    constructor(display) {
        this.display = display;
        this.cent = 0;
        this.seg = 0;
        this.min = 0;
        this.timer = null;
    }

    tic() {
        this.cent++;
        if (this.cent === 100) { this.seg++; this.cent = 0; }
        if (this.seg === 60) { this.min++; this.seg = 0; }
        this.display.textContent = `${this.min}:${this.seg}:${this.cent}`;
    }

    start() {
        if (!this.timer) {
            this.timer = setInterval(() => this.tic(), 10);
        }
    }

    stop() {
        clearInterval(this.timer);
        this.timer = null;
    }

    reset() {
        this.cent = 0;
        this.seg = 0;
        this.min = 0;
        this.display.textContent = "0:0:0";
    }
}

// ===== BLOQUEAR CONTROLES =====
function bloquearControles() {
    document.getElementById("start").disabled = true;
    document.getElementById("stop").disabled = true;
}

// ===== VARIABLES =====
let clave = [];
let intentos = 7;
let usados = new Set();
let juegoActivo = false;

const casillas = document.querySelectorAll(".secret div");
const botones = document.querySelectorAll(".num");
const displayIntentos = document.getElementById("intentos");
const displayTiempo = document.getElementById("tiempo");
const mensaje = document.getElementById("mensaje");
const btnStart = document.getElementById("start");
const btnStop = document.getElementById("stop");

const crono = new Crono(displayTiempo);

// ===== GENERAR CLAVE =====
function generarClave() {
    let nums = [...Array(10).keys()];
    clave = [];

    while (clave.length < 4) {
        let i = Math.floor(Math.random() * nums.length);
        clave.push(nums.splice(i, 1)[0]);
    }
}

// ===== NUEVA PARTIDA =====
function nuevaPartida() {
    generarClave();
    intentos = 7;
    usados.clear();
    juegoActivo = true;

    displayIntentos.textContent = intentos;

    casillas.forEach(c => {
        c.textContent = "*";
        c.className = "";
    });

    botones.forEach(b => {
        b.disabled = false;
        b.classList.remove("used");
    });

    mensaje.textContent = "Nueva partida preparada. Pulsa Start o un número para comenzar.";
    mensaje.className = "msg-info";

    btnStop.classList.remove("stop-activo");
}

// ===== CLICK NUMEROS =====
botones.forEach(boton => {
    boton.addEventListener("click", () => {

        let num = parseInt(boton.textContent);

        if (!juegoActivo) return;

        sonidoClick.play();

        if (!crono.timer) {
            crono.start();
        }

        if (usados.has(num)) return;

        usados.add(num);
        boton.disabled = true;
        boton.classList.add("used");

        intentos--;
        displayIntentos.textContent = intentos;

        let acierto = false;

        clave.forEach((valor, i) => {
            if (valor === num) {
                casillas[i].textContent = num;
                casillas[i].classList.add("correct", "magic");

                setTimeout(() => {
                    casillas[i].classList.remove("magic");
                }, 400);

                acierto = true;
            }
        });

        if (acierto) {
            sonidoAcierto.play();
            mensaje.textContent = `Has acertado el número ${num}. Sigue así`;
            mensaje.className = "msg-ok";
        } else {
            sonidoFallo.play();
            mensaje.textContent = `El número ${num} no está en la clave`;
            mensaje.className = "msg-error";
        }

        comprobarEstado();
    });
});

// ===== ESTADO =====
function comprobarEstado() {

    let ganado = [...casillas].every(c => c.textContent !== "*");

    if (ganado) {
        crono.stop();
        sonidoVictoria.play();

        botones.forEach(b => {
            b.disabled = true;
            b.classList.remove("used");
        });

        bloquearControles();

        mensaje.textContent = `¡Clave descubierta! Tiempo: ${displayTiempo.textContent} - Intentos consumidos: ${7 - intentos} - Intentos restantes: ${intentos}`;
        mensaje.className = "msg-ok";

        juegoActivo = false;
    }

    if (intentos === 0) {
        crono.stop();

        casillas.forEach(c => {
            c.textContent = "*";
            c.classList.add("explosion");
        });

        botones.forEach(b => {
            b.disabled = true;
            b.classList.remove("used");
        });

        sonidoDerrota.play();

        bloquearControles();

        mensaje.textContent = `💥 BOOM. Has agotado los intentos. La clave correcta era ${clave.join("")}. Pulsa Reset para jugar otra vez.`;
        mensaje.className = "msg-error";

        juegoActivo = false;
    }
}

// ===== CONTROLES =====
document.getElementById("start").onclick = () => {
    crono.start();
    btnStop.classList.remove("stop-activo");

    mensaje.textContent = "Cronómetro en marcha. ¡A jugar!";
    mensaje.className = "msg-info";
};

btnStop.onclick = () => {
    crono.stop();
    btnStop.classList.add("stop-activo");

    mensaje.textContent = "Cronómetro detenido.";
    mensaje.className = "msg-stop";
};

document.getElementById("reset").onclick = () => {
    crono.reset();
    nuevaPartida();

        // Reactivar botones
    btnStart.disabled = false;
    btnStop.disabled = false;

};

// ===== INIT =====
nuevaPartida();
