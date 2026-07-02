'use strict';

// ── Restricciones idénticas a la clase Cancion del Ejercicio 2 ──
const TITULO_MAX_LENGTH  = 100;
const ARTISTA_MAX_LENGTH = 100;
const DURACION_MIN       = 1;
const DURACION_MAX       = 600;

// Array en memoria: equivale a la "sesión del usuario" en el navegador
const canciones = [];

// ── Inicialización ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('cancionForm').addEventListener('submit', onSubmit);
    document.getElementById('clearBtn').addEventListener('click', onClear);
});

// ── Manejador del envío del formulario ──────────────────────────
function onSubmit(event) {
    event.preventDefault();

    const titulo      = document.getElementById('titulo').value.trim();
    const artista     = document.getElementById('artista').value.trim();
    const duracionRaw = document.getElementById('duracion').value.trim();
    const duracion    = duracionRaw !== '' ? Number(duracionRaw) : null;

    const errores = validar(titulo, artista, duracion, duracionRaw);

    aplicarEstadoValidacion(errores);

    if (Object.keys(errores).length > 0) {
        return;
    }

    canciones.push({ titulo, artista, duracion: Math.trunc(duracion) });
    renderizarTabla();
    mostrarAlerta('Canción añadida correctamente.', 'success');
    onClear();
}

// ── Lógica de validación (espeja las reglas de la clase Cancion) ─
function validar(titulo, artista, duracion, duracionRaw) {
    const errores = {};

    if (titulo === '') {
        errores.titulo = 'El título no puede estar vacío.';
    } else if (titulo.length > TITULO_MAX_LENGTH) {
        errores.titulo = `El título no puede superar ${TITULO_MAX_LENGTH} caracteres.`;
    }

    if (artista === '') {
        errores.artista = 'El artista no puede estar vacío.';
    } else if (artista.length > ARTISTA_MAX_LENGTH) {
        errores.artista = `El artista no puede superar ${ARTISTA_MAX_LENGTH} caracteres.`;
    }

    if (duracionRaw === '') {
        errores.duracion = 'La duración no puede estar vacía.';
    } else if (!Number.isFinite(duracion) || !Number.isInteger(duracion)) {
        errores.duracion = 'La duración debe ser un número entero.';
    } else if (duracion < DURACION_MIN) {
        errores.duracion = `La duración debe ser al menos ${DURACION_MIN} segundo.`;
    } else if (duracion > DURACION_MAX) {
        errores.duracion = `La duración no puede superar ${DURACION_MAX} segundos.`;
    }

    return errores;
}

// ── Aplica clases Bootstrap y muestra/limpia mensajes de error ──
function aplicarEstadoValidacion(errores) {
    ['titulo', 'artista', 'duracion'].forEach(campo => {
        const input    = document.getElementById(campo);
        const errorDiv = document.getElementById(`${campo}Error`);

        input.classList.remove('is-invalid', 'is-valid');

        if (errores[campo]) {
            input.classList.add('is-invalid');
            errorDiv.textContent = errores[campo];
        } else {
            const tieneValor = input.value.trim() !== '';
            if (tieneValor) {
                input.classList.add('is-valid');
            }
            errorDiv.textContent = '';
        }
    });
}

// ── Renderiza la tabla completa a partir del array en memoria ───
function renderizarTabla() {
    const tbody          = document.getElementById('cancionesBody');
    const tableContainer = document.getElementById('tableContainer');
    const emptyMessage   = document.getElementById('emptyMessage');
    const totalBadge     = document.getElementById('totalCanciones');

    totalBadge.textContent = canciones.length;

    if (canciones.length === 0) {
        tableContainer.classList.add('d-none');
        emptyMessage.classList.remove('d-none');
        return;
    }

    tableContainer.classList.remove('d-none');
    emptyMessage.classList.add('d-none');

    tbody.innerHTML = '';

    canciones.forEach(({ titulo, artista, duracion }, indice) => {
        const fila = document.createElement('tr');
        fila.id = `fila-${indice}`;
        fila.innerHTML = `
            <td>${indice + 1}</td>
            <td>${escaparHtml(titulo)}</td>
            <td>${escaparHtml(artista)}</td>
            <td class="text-center">${duracion}</td>
            <td>
                <button
                    class="btn btn-danger btn-sm"
                    id="eliminar-${indice}"
                    data-indice="${indice}"
                    aria-label="Eliminar canción ${escaparHtml(titulo)}"
                >
                    Eliminar
                </button>
            </td>
        `;
        fila.querySelector('button').addEventListener('click', () => {
            canciones.splice(indice, 1);
            renderizarTabla();
        });
        tbody.appendChild(fila);
    });
}

// ── Muestra una alerta temporal ─────────────────────────────────
function mostrarAlerta(mensaje, tipo) {
    const container = document.getElementById('alertContainer');
    const id        = `alerta-${Date.now()}`;

    const div = document.createElement('div');
    div.id        = id;
    div.className = `alert alert-${tipo} alert-dismissible fade show`;
    div.setAttribute('role', 'alert');
    div.innerHTML = `
        ${escaparHtml(mensaje)}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
    `;

    container.innerHTML = '';
    container.appendChild(div);

    setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.remove('show');
            setTimeout(() => el.remove(), 200);
        }
    }, 4000);
}

// ── Restablece el formulario a su estado inicial ────────────────
function onClear() {
    document.getElementById('cancionForm').reset();
    ['titulo', 'artista', 'duracion'].forEach(campo => {
        document.getElementById(campo).classList.remove('is-invalid', 'is-valid');
        document.getElementById(`${campo}Error`).textContent = '';
    });
}

// ── Previene XSS al insertar texto en el DOM ────────────────────
function escaparHtml(texto) {
    const mapa = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(texto).replace(/[&<>"']/g, c => mapa[c]);
}
