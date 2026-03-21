// ===== SONIDOS =====
var sonidoClick = new Audio("sounds/click.mp3");
var sonidoAcierto = new Audio("sounds/success.mp3");
var sonidoFallo = new Audio("sounds/fail.mp3");
var sonidoVictoria = new Audio("sounds/win.mp3");
var sonidoDerrota = new Audio("sounds/lose.mp3");

// ===== CRONO =====
function Crono(display) {
    this.display = display;
    this.cent = 0;
    this.seg = 0;
    this.min = 0;
    this.timer = null;
}

Crono.prototype.tic = function () {
    this.cent++;

    if (this.cent === 100) {
        this.seg++;
        this.cent = 0;
    }

    if (this.seg === 60) {
        this.min++;
        this.seg = 0;
    }

    this.display.textContent = this.min + ":" + this.seg + ":" + this.cent;
};

Crono.prototype.start = function () {
    var self = this;

    if (!this.timer) {
        this.timer = setInterval(function () {
            self.tic();
        }, 10);
    }
};

Crono.prototype.stop = function () {
    clearInterval(this.timer);
    this.timer = null;
};

Crono.prototype.reset = function () {
    this.cent = 0;
    this.seg = 0;
    this.min = 0;
    this.display.textContent = "0:0:0";
};

// ===== BLOQUEAR CONTROLES =====
function bloquearControles() {
    document.getElementById("start").disabled = true;
    document.getElementById("stop").disabled = true;
}

// ===== FUNCIÓN AUXILIAR (SIN WARNING) =====
function quitarMagia(elemento) {
    setTimeout(function () {
        elemento.classList.remove("magic");
    }, 400);
}

// ===== VARIABLES =====
var clave = [];
var intentos = 7;
var usados = [];
var juegoActivo = false;

var casillas = document.querySelectorAll(".secret div");
var botones = document.querySelectorAll(".num");
var displayIntentos = document.getElementById("intentos");
var displayTiempo = document.getElementById("tiempo");
var mensaje = document.getElementById("mensaje");
var btnStart = document.getElementById("start");
var btnStop = document.getElementById("stop");

var crono = new Crono(displayTiempo);

// ===== GENERAR CLAVE =====
function generarClave() {
    var nums = [0,1,2,3,4,5,6,7,8,9];
    clave = [];

    while (clave.length < 4) {
        var i = Math.floor(Math.random() * nums.length);
        clave.push(nums.splice(i, 1)[0]);
    }
}

// ===== NUEVA PARTIDA =====
function nuevaPartida() {
    generarClave();
    intentos = 7;
    usados = [];
    juegoActivo = true;

    displayIntentos.textContent = intentos;

    var i;
    for (i = 0; i < casillas.length; i++) {
        casillas[i].textContent = "*";
        casillas[i].className = "";
    }

    for (i = 0; i < botones.length; i++) {
        botones[i].disabled = false;
        botones[i].classList.remove("used");
    }

    mensaje.textContent = "Nueva partida preparada. Pulsa Start o un número para comenzar.";
    mensaje.className = "msg-info";

    btnStop.classList.remove("stop-activo");
}

// ===== CLICK NUMEROS =====
function manejarClick(boton) {

    var num = parseInt(boton.textContent, 10);

    if (!juegoActivo) return;

    sonidoClick.play();

    if (!crono.timer) {
        crono.start();
        btnStop.classList.remove("stop-activo");

        mensaje.textContent = "Cronómetro en marcha.";
        mensaje.className = "msg-info";
    }

    if (usados.indexOf(num) !== -1) return;

    usados.push(num);
    boton.disabled = true;
    boton.classList.add("used");

    intentos--;
    displayIntentos.textContent = intentos;

    var acierto = false;
    var i;

    for (i = 0; i < clave.length; i++) {
        if (clave[i] === num) {

            casillas[i].textContent = num;
            casillas[i].classList.add("correct", "magic");

            quitarMagia(casillas[i]);

            acierto = true;
        }
    }

    if (acierto) {
        sonidoAcierto.play();
        mensaje.textContent = "Has acertado el número " + num + ". Sigue así";
        mensaje.className = "msg-ok";
    } else {
        sonidoFallo.play();
        mensaje.textContent = "El número " + num + " no está en la clave";
        mensaje.className = "msg-error";
    }

    comprobarEstado();
}

// ===== EVENTOS BOTONES =====
function clickNumero() {
    manejarClick(this);
}

var j;
for (j = 0; j < botones.length; j++) {
    botones[j].addEventListener("click", clickNumero);
}

// ===== ESTADO =====
function comprobarEstado() {

    var ganado = true;
    var i;

    for (i = 0; i < casillas.length; i++) {
        if (casillas[i].textContent === "*") {
            ganado = false;
            break;
        }
    }

    if (ganado) {
        crono.stop();
        sonidoVictoria.play();

        for (i = 0; i < botones.length; i++) {
            botones[i].disabled = true;
            botones[i].classList.remove("used");
        }

        bloquearControles();

        mensaje.textContent = "¡Clave descubierta! Tiempo: " + displayTiempo.textContent +
            " - Intentos consumidos: " + (7 - intentos) +
            " - Intentos restantes: " + intentos;

        mensaje.className = "msg-ok";

        juegoActivo = false;
    }

    if (intentos === 0) {
        crono.stop();

        for (i = 0; i < casillas.length; i++) {
            casillas[i].textContent = "*";
            casillas[i].classList.add("explosion");
        }

        for (i = 0; i < botones.length; i++) {
            botones[i].disabled = true;
            botones[i].classList.remove("used");
        }

        sonidoDerrota.play();

        bloquearControles();

        mensaje.textContent = "💥 BOOM. Has agotado los intentos. La clave correcta era " +
            clave.join("") + ". Pulsa Reset para jugar otra vez.";

        mensaje.className = "msg-error";

        juegoActivo = false;
    }
}

// ===== CONTROLES =====
btnStart.onclick = function () {
    crono.start();
    btnStop.classList.remove("stop-activo");

    mensaje.textContent = "Cronómetro en marcha. ¡A jugar!";
    mensaje.className = "msg-info";
};

btnStop.onclick = function () {
    crono.stop();
    btnStop.classList.add("stop-activo");

    mensaje.textContent = "Cronómetro detenido.";
    mensaje.className = "msg-stop";
};

document.getElementById("reset").onclick = function () {
    crono.reset();
    nuevaPartida();

    btnStart.disabled = false;
    btnStop.disabled = false;
};

// ===== INIT =====
nuevaPartida();
