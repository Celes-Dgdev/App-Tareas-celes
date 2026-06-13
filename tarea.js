const listaTareas = document.getElementById("listaTareas");
const alarma = document.getElementById("alarma");
const errorHora = document.getElementById("errorHora");

const input = document.getElementById("nuevaTarea");
const horaInput = document.getElementById("horaTarea");

const tareasGuardadas = localStorage.getItem("tareas");

let tareas = tareasGuardadas
  ? JSON.parse(tareasGuardadas)
  : [];


// 📅 Mostrar fecha
function mostrarFecha() {

  const hoy = new Date();

  const opciones = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  };

  document.getElementById("fecha").textContent =
    hoy.toLocaleDateString("es-MX", opciones);

  document.getElementById("fechaCreacion").textContent =
    hoy.toLocaleString();
}


// 🕒 Convertir a formato AM/PM
function formato12Horas(hora24) {

  const [hora, minutos] = hora24.split(':');

  let h = parseInt(hora);

  const ampm = h >= 12 ? 'PM' : 'AM';

  h = h % 12;

  h = h ? h : 12;

  return `${h}:${minutos} ${ampm}`;
}


// ➕ Agregar tarea
function agregarTarea() {

  errorHora.textContent = "";

  const texto = input.value.trim();

  const hora = horaInput.value;

  // ❌ validar texto
  if (!texto) {

    alert("⚠️ Escribe una tarea");

    return;
  }

  // ❌ validar hora
  if (!hora) {

    errorHora.textContent =
      "⚠️ Ingresa una hora";

    return;
  }

  // 📦 Crear objeto tarea
  const tarea = {

    texto: texto,

    hora: hora,

    hecha: false,

    notificada: false
  };

  // 📥 Guardar en array
  tareas.push(tarea);

  // 💾 guardar y actualizar
  guardarYMostrar();

  // 🧹 limpiar inputs
  input.value = "";

  horaInput.value = "";
}


// 💾 Guardar en localStorage
function guardarYMostrar() {

  localStorage.setItem(
    "tareas",
    JSON.stringify(tareas)
  );

  mostrarTareas();
}


// 🎨 Mostrar tareas
function mostrarTareas(filtro = "todas") {

  listaTareas.innerHTML = "";

  tareas.forEach((tarea, i) => {

    // 🔍 filtros
    if (filtro === "hechas" && !tarea.hecha) return;

    if (filtro === "pendientes" && tarea.hecha) return;

    // 📦 crear div
    const div = document.createElement("div");

    div.className =
      "tarea" + (tarea.hecha ? " hecha" : "");

    // 📝 contenido
    div.innerHTML = `

      <span>
        ${tarea.texto}
        -
        ${formato12Horas(tarea.hora)}
      </span>

      <div>

        <button onclick="marcarHecha(${i})">
          ✔️
        </button>

        <button onclick="eliminarTarea(${i})">
          ❌
        </button>

      </div>
    `;

    listaTareas.appendChild(div);
  });
}


// ✔️ Marcar completada
function marcarHecha(i) {

  tareas[i].hecha =
    !tareas[i].hecha;

  guardarYMostrar();
}


// 🗑️ Eliminar tarea
function eliminarTarea(i) {

  tareas.splice(i, 1);

  guardarYMostrar();
}


// 🔎 Filtrar tareas
function filtrarTareas(tipo) {

  mostrarTareas(tipo);
}


// ⌨️ ENTER agrega tarea
input.addEventListener("keydown", (e) => {

  if (e.key === "Enter") {

    e.preventDefault();

    agregarTarea();
  }
});


// 🔔 Notificaciones
function mostrarNotificacion(mensaje) {

  if (Notification.permission === "granted") {

    new Notification(
      "📌 Recordatorio",
      {
        body: mensaje
      }
    );

  } else if (
    Notification.permission !== "denied"
  ) {

    Notification
      .requestPermission()
      .then((permiso) => {

        if (permiso === "granted") {

          mostrarNotificacion(mensaje);
        }
      });
  }
}


// 🔊 Revisar alarmas
setInterval(() => {

  const ahora = new Date();

  const horaActual =
    ahora.toTimeString().slice(0, 5);

  tareas.forEach((tarea, index) => {

    if (

      tarea.hora === horaActual &&

      !tarea.notificada &&

      !tarea.hecha

    ) {

      // 🔊 voz
      const voz =
        new SpeechSynthesisUtterance(

          ` Ya es hora!. Es hora de ${tarea.texto}`
        );

      voz.lang = "es-ES";

      speechSynthesis.speak(voz);

      // 🔔 notificación
      mostrarNotificacion(tarea.texto);

      // ✔️ marcar notificada
      tareas[index].notificada = true;

      guardarYMostrar();
    }
  });

}, 60000);


// 🚀 Inicializar app
mostrarFecha();

mostrarTareas();


// 🔔 pedir permisos
if ("Notification" in window) {

  Notification.requestPermission();
}