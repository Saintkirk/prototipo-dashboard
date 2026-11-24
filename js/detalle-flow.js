// Detalle del sitio: datos, línea de estados, historial y acciones según el rol de la sesión.
import {
  ESTADOS, ACTORES, listarSitios, obtenerSitio, accionSiguiente, motivoBloqueo, esPropio, aplicarAccion
} from './store.js';
import { ROLES, urlPara } from './roles.js';
import { esc, avisoTransicion, avisoRechazo, mostrarAviso, mostrarAccesoDenegado } from './ui.js';

const sitioPorDefecto = rol => {
  if (rol === 'terreno' || rol === 'dibujante') return listarSitios().find(s => esPropio(rol, s))?.id;
  return '0431';
};

const pasosHtml = sitio => ESTADOS.map((nombre, i) => {
  const hecho = i < sitio.estado || (sitio.estado === 7 && i === 7);
  const activo = i === sitio.estado && !hecho;
  const marca = hecho ? `<i class="h">${i + 1}</i>${nombre}` : activo ? `<i class="a">${i + 1}</i><b>${nombre}</b>` : `<i>${i + 1}</i>${nombre}`;
  return `<div${hecho ? ' class="done"' : ''}${activo ? ' aria-current="step"' : ''}>${marca}</div>`;
}).join('');

const datosHtml = sitio => {
  const informe = sitio.estado >= 3;
  const plano = sitio.estado >= 5;
  const revision = sitio.revision
    ? `${sitio.revision.resultado === 'aprobado' ? 'Aprobado' : 'Observado'} ${sitio.revision.fecha}`
    : sitio.estado >= 3 ? 'Pendiente de revisión' : 'Aún sin informe';
  return `
    <b>Datos del sitio</b>
    <p class="mt-2"><b>Cliente:</b> ${esc(sitio.cliente)}</p>
    <p class="mt-1"><b>Tipo de visita:</b> ${esc(sitio.tipo)}</p>
    <p class="mt-1"><b>Comuna / región:</b> ${esc(sitio.comuna)}</p>
    <p class="mt-1"><b>Plazo:</b> ${esc(sitio.plazo)}</p>
    <p class="mt-1"><b>Equipo de terreno:</b> ${esc(sitio.equipo)}</p>
    <p class="mt-1"><b>Revisión:</b> ${esc(revision)}</p>
    <p class="mt-1"><b>Dibujante:</b> ${esc(sitio.dibujante ?? 'Sin asignar')}</p>
    ${sitio.observacion ? `<p class="mt-1"><b>Observación del revisor:</b> ${esc(sitio.observacion)}</p>` : ''}

    <b class="mt-3" style="display:block">Enlaces a Drive</b>
    <p class="mt-1">Fotos y croquis — ${informe ? `enlace registrado por ${esc(sitio.equipo)}` : 'pendiente de enlazar'}</p>
    <p class="mt-1">Informe de visita — ${informe ? `enlace registrado por ${esc(sitio.equipo)}` : 'pendiente de enlazar'}</p>
    <p class="mt-1">Plano — ${plano ? `enlace registrado por ${esc(sitio.dibujante ?? ACTORES.dibujante)}` : 'pendiente de enlazar'}</p>`;
};

const historialHtml = sitio => [...sitio.historial].reverse().map((h, i) =>
  `<p class="${i ? 'mt-1' : 'mt-2'}">${esc(h.fecha)} · ${esc(h.texto)}${h.estado === null ? '' : ` → <b>${ESTADOS[h.estado]}</b>`}</p>`
).join('');

// Acciones del panel derecho, filtradas por la matriz de permisos del informe (5.2)
const accionesHtml = (rol, sitio) => {
  const { etiqueta, inicio } = ROLES[rol];
  const siguiente = accionSiguiente(sitio);
  let principal;

  if (rol === 'revisor') {
    principal = `<p class="text-sm text-muted mt-2">Solo lectura. La aprobación u observación del informe se hace desde la bandeja de revisión.</p>
      <div class="flex gap-2 mt-2 flex-wrap"><a class="btn" href="${urlPara('revisor.html', rol)}">Ir a Revisión</a></div>`;
  } else if (siguiente?.roles.includes(rol)) {
    const bloqueo = motivoBloqueo(rol, sitio, siguiente);
    principal = bloqueo
      ? `<div class="flex gap-2 mt-2 flex-wrap"><button class="btn" type="button" disabled aria-describedby="motivo-bloqueo">${esc(siguiente.etiqueta)}</button></div>
         <p class="text-sm text-muted mt-1" id="motivo-bloqueo">No disponible: ${esc(bloqueo)}</p>`
      : `<div class="flex gap-2 mt-2 flex-wrap"><button class="btn" type="button" data-accion="${siguiente.id}">${esc(siguiente.etiqueta)}</button></div>
         <p class="text-sm text-muted mt-1">${ESTADOS[siguiente.desde]} <span aria-hidden="true">→</span><span class="sr-only">a</span> ${ESTADOS[siguiente.hacia]}</p>`;
  } else {
    const fin = sitio.estado === 7 ? 'El ciclo del sitio está completo.' : `Sin acciones para tu rol en el estado «${ESTADOS[sitio.estado]}».`;
    principal = `<p class="text-sm text-muted mt-2">${fin}</p>`;
  }

  return `
    <b class="mt-3" style="display:block">Acciones disponibles para tu rol (${esc(etiqueta)})</b>
    ${principal}
    <div class="flex gap-2 mt-2 flex-wrap">
      <button class="btn g" type="button" data-drive>Ver en Drive</button>
      <a class="btn g" href="${urlPara(inicio, rol)}">${rol === 'jefe' ? 'Volver al panel' : 'Volver a mi inicio'}</a>
    </div>`;
};

export function initDetalleFlow(rol) {
  const params = new URLSearchParams(location.search);
  const id = params.get('sitio') ?? sitioPorDefecto(rol);
  const sitio = id ? obtenerSitio(id) : null;
  const { etiqueta, inicio } = ROLES[rol];

  if (!sitio) {
    mostrarAccesoDenegado(etiqueta, 'No hay un sitio disponible para mostrar con tu rol.', urlPara(inicio, rol), 'Ir a mi inicio');
    document.querySelector('.top h1').textContent = 'Sitio no disponible';
    return;
  }
  // Autorización por objeto (PS-01 / OWASP A01): terreno y dibujante solo ven sitios propios
  if (!esPropio(rol, sitio)) {
    mostrarAccesoDenegado(etiqueta, `El sitio ${sitio.id} no es de tu alcance: ${rol === 'terreno' ? 'pertenece a otro equipo' : 'no está asignado a ti'}.`, urlPara(inicio, rol), 'Volver a mi inicio');
    return;
  }

  const pintar = () => {
    document.title = `Detalle del sitio ${sitio.id} · EGC Ingeniería`;
    document.querySelector('.top h1').textContent = `Sitio ${sitio.id} · ${sitio.nombre}`;
    document.getElementById('detalle-pasos').innerHTML = pasosHtml(sitio);
    document.getElementById('detalle-datos').innerHTML = datosHtml(sitio);
    document.getElementById('detalle-historial').innerHTML = `<b>Historial</b>${historialHtml(sitio)}${accionesHtml(rol, sitio)}`;

    document.querySelector('[data-accion]')?.addEventListener('click', e => {
      const r = aplicarAccion(sitio.id, e.currentTarget.dataset.accion, rol);
      if (!r.ok) { avisoRechazo(r.error, etiqueta); return; }
      Object.assign(sitio, r.sitio);
      pintar();
      avisoTransicion(r, etiqueta);
    });
    document.querySelector('[data-drive]')?.addEventListener('click', () => mostrarAviso({
      titulo: 'Enlace a Drive', texto: 'Aquí se abriría la carpeta del sitio en Google Drive.', detalle: 'Prototipo: sin conexión real a Drive'
    }));
  };
  pintar();
}
