console.log("Ejecutando JS...");


//-- Elementos de la interfaz de la calculadora
display = document.getElementById("display")
boton1 = document.getElementById("boton1")
boton2 = document.getElementById("boton2")
suma = document.getElementById("suma")
igual = document.getElementById("igual")
clear = document.getElementById("clear")

//-- Funciones de retrollamada de los botones
//-- Cada vez que se aprieta un botón se actúa
//-- sobre la cadena: añadiendo dígito, operador +
//-- poniendo a cero o evaluando la expresión

// // -- Insertar digito 1
// boton1.onclick = () => {
//   display.innerHTML += boton1.value;
// }

// //-- Insertar digito 2
// boton2.onclick = () => {
//   display.innerHTML += boton2.value;
// }

// //-- Insertar simbolo de sumar
// suma.onclick = () => {
//   display.innerHTML += suma.value;
// }


// // -- Digito 1
// boton1.onclick = (ev) => {
//   display.innerHTML += ev.target.value;
// }

// //-- Digito 2
// boton2.onclick = (ev) => {
//   display.innerHTML += ev.target.value;
// }

//-- Obtener una colección con todos los elementos
//-- de la clase dígito
digitos = document.getElementsByClassName("digito")

//-- Establecer la misma función de retrollamada
//-- para todos los botones de tipo dígito
for (let boton of digitos) {

    //-- Se ejecuta cuando se pulsa un boton
    //-- que es un dígito
    boton.onclick = (ev) => {
        display.innerHTML += ev.target.value;
        console.log("DIGITO!!!");
    }
}


// La operación de sumar se queda igual

//-- Simbolo de sumar
suma.onclick = (ev) => {
  display.innerHTML += ev.target.value;
}


//-- Evaluar la expresión
igual.onclick = () => {
  display.innerHTML = eval(display.innerHTML);
}

//-- Poner a cero la expresión
clear.onclick = () => {
  display.innerHTML = "0";
}