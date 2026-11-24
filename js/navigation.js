import { svgIcon, ICONS } from './icons.js';
import { ROLES, MENU_PUBLICO, urlPara } from './roles.js';

const buildNavLink = (archivo, label, icon, rol, opciones = {}) => {
  if (opciones.deshabilitado) {
    return `<a class="nav-link nav-link-disabled" aria-disabled="true" title="Disponible en la V2">${svgIcon(ICONS[icon])}<span>${label}</span></a>`;
  }
  const href = rol ? urlPara(archivo, rol) : archivo;
  return `<a class="nav-link" href="${href}" data-route="${archivo}">${svgIcon(ICONS[icon])}<span>${label}</span></a>`;
};

// Grupos de menú de un rol (o del menú público si no hay sesión)
const buildNavGroups = rol => (rol ? ROLES[rol].grupos : MENU_PUBLICO).map(g => `
        <section class="nav-group" data-nav-group="${g.id}">
          <button class="nav-group-toggle" type="button" aria-expanded="false" aria-controls="nav-${g.id}">${svgIcon(ICONS[g.icono])}<span>${g.titulo}</span>${svgIcon(ICONS.chevron, 'nav-chevron')}</button>
          <div class="nav-collapse" id="nav-${g.id}"><div class="nav-clip"><div class="nav-links">
            ${g.links.map(([archivo, label, icon, opciones]) => buildNavLink(archivo, label, icon, rol, opciones)).join('\n            ')}
          </div></div></div>
        </section>`).join('');

export function initDesktopNav(currentRoute, rol = null) {
  const desktopSide = document.querySelector('.side');
  if (!desktopSide) return;

  desktopSide.innerHTML = `
    <a class="brand" href="index.html" aria-label="EGC Ingeniería, inicio">
      <span class="brand-mark">${svgIcon(ICONS.mark, '')}</span><span class="brand-copy">EGC<small>INGENIERÍA</small></span>
    </a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-nav">${svgIcon(ICONS.menu)}<span>Menú</span></button>
    <nav class="primary-nav" id="primary-nav" aria-label="Navegación principal">
      <div class="primary-nav-inner">
        <div class="nav-label">${rol ? 'Plataforma' : 'Demostración'}</div>${buildNavGroups(rol)}
      </div>
    </nav>
    <div class="side-bottom"><strong>${rol ? ROLES[rol].etiqueta : 'Sin sesión'}</strong>Sesión de demostración · Google</div>`;

  // El encabezado muestra al usuario del rol activo (antes quedaba fijo en jefe@empresa.cl)
  const usuario = document.querySelector('.top .u');
  if (rol && usuario) {
    usuario.innerHTML = `${ROLES[rol].correo} &nbsp;|&nbsp; <a href="login.html">Salir</a>`;
  }

  desktopSide.querySelectorAll('.nav-link[data-route]').forEach(a => {
    if (a.dataset.route === currentRoute) {
      a.setAttribute('aria-current', 'page');
      a.closest('.nav-group')?.classList.add('is-open');
    }
  });

  // Con un solo grupo (todos los roles salvo el índice) el menú queda abierto: es lo único que el rol puede hacer
  const grupos = desktopSide.querySelectorAll('.nav-group');
  if (grupos.length === 1) grupos[0].classList.add('is-open');

  desktopSide.querySelectorAll('.nav-group-toggle').forEach(button => {
    const group = button.closest('.nav-group');
    const panel = document.getElementById(button.getAttribute('aria-controls'));
    const setOpen = open => {
      group.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', String(open));
      panel.setAttribute('aria-hidden', String(!open));
      panel.inert = !open;
    };
    setOpen(group.classList.contains('is-open'));
    button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'));
  });

  const menuButton = desktopSide.querySelector('.nav-toggle');
  menuButton?.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    desktopSide.classList.toggle('nav-open', open);
    document.getElementById('primary-nav').inert = !open && matchMedia('(max-width: 900px)').matches;
  });

  const syncNav = () => {
    const isCompact = matchMedia('(max-width: 900px)').matches;
    if (!isCompact) {
      desktopSide.classList.remove('nav-open');
      menuButton?.setAttribute('aria-expanded', 'false');
      document.getElementById('primary-nav').inert = false;
    } else {
      document.getElementById('primary-nav').inert = menuButton?.getAttribute('aria-expanded') !== 'true';
    }
  };
  addEventListener('resize', syncNav, { passive: true });
  syncNav();

  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (menuButton?.getAttribute('aria-expanded') === 'true') {
      menuButton.setAttribute('aria-expanded', 'false');
      desktopSide.classList.remove('nav-open');
      document.getElementById('primary-nav').inert = true;
      menuButton.focus();
      return;
    }
    const focusedGroup = document.activeElement.closest('.nav-group')?.querySelector('.nav-group-toggle[aria-expanded="true"]');
    const expandedGroups = [...desktopSide.querySelectorAll('.nav-group-toggle[aria-expanded="true"]')];
    const target = focusedGroup || expandedGroups[expandedGroups.length - 1];
    if (!target) return;
    const panel = document.getElementById(target.getAttribute('aria-controls'));
    target.setAttribute('aria-expanded', 'false');
    target.closest('.nav-group').classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    panel.inert = true;
    target.focus();
  });
}

export function initMobileNav(currentRoute, rol = null) {
  const mobileBar = document.querySelector('.mov .bar');
  if (!mobileBar || !rol) return;

  const { etiqueta, identidad, grupos } = ROLES[rol];
  const links = grupos.flatMap(g => g.links).filter(([archivo]) => archivo).map(([archivo, label]) => [archivo, label]);
  const role = `${etiqueta} · ${identidad}`;

  mobileBar.innerHTML = `<div class="mobile-brand"><span class="brand-mark">${svgIcon(ICONS.mark, '')}</span><span>EGC <em>Ingeniería</em><small>${role} · <a href="login.html">Salir</a></small></span></div><button class="mobile-menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu">${svgIcon(ICONS.menu, '')}<span>Secciones</span></button>`;

  const menu = document.createElement('nav');
  menu.className = 'mobile-menu';
  menu.id = 'mobile-menu';
  menu.setAttribute('aria-label', 'Secciones del prototipo');
  menu.innerHTML = `<div class="mobile-menu-clip"><div class="mobile-menu-links">${links.map(([href, label]) => `<a href="${urlPara(href, rol)}"${currentRoute === href ? ' aria-current="page"' : ''}>${label}</a>`).join('')}</div></div>`;
  mobileBar.insertAdjacentElement('afterend', menu);

  const toggle = mobileBar.querySelector('.mobile-menu-toggle');
  const setMenu = open => {
    toggle.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    menu.inert = !open;
  };
  // En pantallas grandes las secciones quedan siempre visibles; en celular se despliegan con el boton.
  const escritorio = window.matchMedia('(min-width: 1024px)');
  const sincronizar = () => setMenu(escritorio.matches);
  sincronizar();
  escritorio.addEventListener('change', sincronizar);
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !escritorio.matches && toggle.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      toggle.focus();
    }
  });
}

export function enhanceResponsiveTables() {
  const headers = [...document.querySelectorAll('table.res thead th')].map(th => th.textContent.trim());
  document.querySelectorAll('table.res tbody tr').forEach(row => {
    [...row.cells].forEach((cell, i) => {
      if (headers[i]) cell.dataset.label = headers[i];
    });
    if (row.classList.contains('clic')) {
      row.tabIndex = 0;
      row.setAttribute('role', 'link');
      row.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          row.click();
        }
      });
    }
  });
}