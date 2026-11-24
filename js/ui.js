// Utilidades de interfaz compartidas: escape de texto, chips de estado y avisos de transición.
import { ESTADOS } from './store.js';

export const esc = texto => String(texto).replace(/[&<>"']/g, c => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

export const chip = estado => `<span class="chip s${estado + 1}">${ESTADOS[estado]}</span>`;

let temporizador;

// Aviso flotante accesible (role="status"). Para una transición: titulo = sitio, texto = «Desde → Hacia».
export function mostrarAviso({ titulo, texto, detalle = '', tipo = 'ok' }) {
  let aviso = document.getElementById('aviso-global');
  if (!aviso) {
    aviso = document.createElement('div');
    aviso.id = 'aviso-global';
    aviso.className = 'toast';
    aviso.setAttribute('role', 'status');
    aviso.setAttribute('aria-live', 'polite');
    document.body.appendChild(aviso);
  }
  aviso.dataset.tipo = tipo;
  aviso.innerHTML =
    `<div class="toast-body"><b>${esc(titulo)}</b><span class="toast-texto">${texto}</span>` +
    (detalle ? `<small>${esc(detalle)}</small>` : '') +
    `</div><button type="button" class="toast-cerrar" aria-label="Cerrar aviso">×</button>`;
  aviso.hidden = false;
  aviso.querySelector('.toast-cerrar').addEventListener('click', () => { aviso.hidden = true; });
  clearTimeout(temporizador);
  temporizador = setTimeout(() => { aviso.hidden = true; }, 8000);
}

export const avisoTransicion = (r, rolEtiqueta) => mostrarAviso({
  titulo: `Sitio ${r.sitio.id} · ${r.sitio.nombre}`,
  texto: r.desde === r.hacia
    ? `Informe aprobado · <b>${esc(r.hacia)}</b>`
    : `<b>${esc(r.desde)}</b> <span aria-hidden="true">→</span><span class="sr-only">a</span> <b>${esc(r.hacia)}</b>`,
  detalle: `Transición validada para el rol ${rolEtiqueta} · simulación sin backend`
});

export const avisoRechazo = (error, rolEtiqueta) => mostrarAviso({
  titulo: 'Acción rechazada (simula 403/409 del backend)',
  texto: esc(error),
  detalle: `Rol ${rolEtiqueta}`,
  tipo: 'error'
});

// Pantalla de acceso denegado para el rol activo
export function mostrarAccesoDenegado(rolEtiqueta, motivo, inicioHref, inicioTexto) {
  const principal = document.querySelector('main');
  if (!principal) return;
  const h1 = document.querySelector('.top h1');
  if (h1) h1.textContent = 'Acceso denegado';
  principal.innerHTML =
    `<section class="card acceso-denegado" role="alert">` +
    `<span class="chip s8">403 · Prohibido</span>` +
    `<h2>${esc(motivo)}</h2>` +
    `<p class="text-sm text-muted mt-2">Tu sesión simulada tiene el rol <b>${esc(rolEtiqueta)}</b>. ` +
    `En el sistema real el backend valida el permiso en cada solicitud y responde 403; ` +
    `la interfaz solo oculta lo que el rol no puede hacer (informe, sección 5.2).</p>` +
    `<div class="flex gap-2 mt-3 flex-wrap">` +
    `<a class="btn" href="${inicioHref}">${esc(inicioTexto)}</a>` +
    `<a class="btn g" href="login.html">Cambiar de rol</a></div></section>`;
}
