import { initDesktopNav, initMobileNav, enhanceResponsiveTables } from './js/navigation.js';
import { initPanelFlow } from './js/panel-flow.js';
import { initReviewFlow } from './js/review-flow.js';
import { initAsignacionFlow } from './js/asignacion-flow.js';

const currentRoute = location.pathname.split('/').pop() || 'index.html';

// 1. Capa de interfaz global
initDesktopNav(currentRoute);
initMobileNav(currentRoute);
enhanceResponsiveTables();

// 2. Capa de flujos por vista
const ROUTE_HANDLERS = {
  'panel.html': initPanelFlow,
  'revisor.html': initReviewFlow,
  'asignacion.html': initAsignacionFlow
};

ROUTE_HANDLERS[currentRoute]?.();