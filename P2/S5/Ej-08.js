console.log("Ejecutando JS...");

const botones = document.getElementsByClassName("digito");
const display = document.getElementById('display');

for (let boton of botones) {
    console.log("Boton: " +  boton.value)
}

//-- Función de retrollamada de los botones
//-- botones de la clase dígito
function digito(value)
{
  console.log("Valor: " + value);
  display.innerHTML = "Valor del Botón pulsado: " + value;
}


for (let boton of botones) {

  //-- Establecer la función de llamada del botón i
  //-- El parámetro ev.target contiene el boton
  //-- que ha recibido el clic
  boton.onclick = (ev) => {
    digito(ev.target.value)
  }
}