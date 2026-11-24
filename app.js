import { initDesktopNav, initMobileNav, enhanceResponsiveTables } from './js/navigation.js';
import { initPanelFlow } from './js/panel-flow.js';
import { initReviewFlow } from './js/review-flow.js';
import { initAsignacionFlow } from './js/asignacion-flow.js';
import { initDetalleFlow } from './js/detalle-flow.js';
import { initTerrenoFlow, initDibujanteFlow } from './js/mobile-flow.js';
import { resolverSesion, ROLES, urlPara } from './js/roles.js';
import { mostrarAccesoDenegado } from './js/ui.js';
import { reiniciarDemo } from './js/store.js';

const currentRoute = location.pathname.split('/').pop() || 'index.html';

// 0. Sesión simulada y control de acceso por pantalla (equivale al 403 del backend)
const sesion = resolverSesion(currentRoute);

// 1. Capa de interfaz global (el menú depende del rol)
initDesktopNav(currentRoute, sesion.rol);
initMobileNav(currentRoute, sesion.rol);

// 2. Capa de flujos por vista
const ROUTE_HANDLERS = {
  'panel.html': initPanelFlow,
  'revisor.html': initReviewFlow,
  'asignacion.html': initAsignacionFlow,
  'detalle.html': initDetalleFlow,
  'terreno.html': initTerrenoFlow,
  'dibujante.html': initDibujanteFlow
};

if (sesion.permitido) {
  ROUTE_HANDLERS[currentRoute]?.(sesion.rol);
} else {
  const rol = ROLES[sesion.rol];
  const pantalla = document.title.split('·')[0].trim();
  mostrarAccesoDenegado(
    rol.etiqueta,
    `La pantalla «${pantalla}» no está disponible para el rol ${rol.etiqueta}.`,
    urlPara(rol.inicio, sesion.rol),
    `Ir a mi inicio (${rol.etiqueta})`
  );
}

enhanceResponsiveTables();

// 3. Herramienta de demostración: volver a los datos iniciales
const botonReinicio = () => {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'demo-reset';
  b.textContent = 'Reiniciar datos de la demo';
  b.addEventListener('click', () => { reiniciarDemo(); location.href = 'login.html'; });
  return b;
};
document.querySelector('.demo')?.append(' · ', botonReinicio());
document.querySelector('.index-heading')?.append(botonReinicio());
