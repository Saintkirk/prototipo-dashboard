// Vistas móviles de Terreno y Dibujante: tarjetas por sitio propio con la acción que su rol puede ejecutar.
import { ESTADOS, ACTORES, listarSitios, accionSiguiente, motivoBloqueo, aplicarAccion } from './store.js';
import { ROLES, urlPara } from './roles.js';
import { esc, chip, avisoTransicion, avisoRechazo } from './ui.js';

const metaHtml = s => `${esc(s.cliente)} · ${esc(s.tipo)} · Plazo ${s.plazo.slice(0, 5)}`;

function tarjeta(s, rol) {
  const siguiente = accionSiguiente(s);
  const puede = siguiente?.roles.includes(rol) && !motivoBloqueo(rol, s, siguiente);
  const nota = s.observacion
    ? `<p class="text-sm text-muted mt-1">Observación del revisor: ${esc(s.observacion)}</p>`
    : '';
  const sinAccion = puede ? '' : `<p class="text-sm text-muted mt-1">${
    s.estado === 5 ? 'Plano enlazado. El jefe de área registra la entrega.' : 'En revisión: sin acciones pendientes para ti.'}</p>`;
  return `
      <article class="card" data-sitio="${esc(s.id)}">
        <b>${esc(s.id)} · ${esc(s.nombre)}</b> ${chip(s.estado)}
        <p class="text-sm text-muted mt-1">${metaHtml(s)}</p>
        ${nota}${sinAccion}
        ${puede ? `<button class="btn" type="button" data-accion="${siguiente.id}">${esc(siguiente.etiqueta)}</button>` : ''}
        <a class="btn g" href="${urlPara('detalle.html', rol, { sitio: s.id })}">Ver detalle</a>
      </article>`;
}

function iniciar(rol, filtro, vacio) {
  const lista = document.querySelector('[data-lista]');
  if (!lista) return;

  const pintar = idDestacado => {
    const sitios = listarSitios().filter(filtro);
    lista.innerHTML = sitios.length ? sitios.map(s => tarjeta(s, rol)).join('') : `<div class="card"><p class="text-sm text-muted">${vacio}</p></div>`;
    if (idDestacado) lista.querySelector(`[data-sitio="${CSS.escape(idDestacado)}"] .chip`)?.classList.add('chip-nuevo');
  };

  lista.addEventListener('click', e => {
    const boton = e.target.closest('[data-accion]');
    if (!boton) return;
    const id = boton.closest('[data-sitio]').dataset.sitio;
    const r = aplicarAccion(id, boton.dataset.accion, rol);
    if (!r.ok) { avisoRechazo(r.error, ROLES[rol].etiqueta); return; }
    pintar(id);
    avisoTransicion(r, ROLES[rol].etiqueta);
  });
  pintar();
}

export const initTerrenoFlow = rol => iniciar(
  rol,
  s => s.equipo === ACTORES.terreno && s.estado >= 1 && s.estado <= 3,
  'No tienes visitas programadas esta semana.'
);

export const initDibujanteFlow = rol => iniciar(
  rol,
  s => s.dibujante === ACTORES.dibujante && s.estado >= 4 && s.estado <= 5,
  'No tienes planos asignados por ahora.'
);
