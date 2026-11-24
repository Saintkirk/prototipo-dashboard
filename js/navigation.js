import { svgIcon, ICONS } from './icons.js';

const buildNavLink = (href, label, icon, key) =>
  `<a class="nav-link" href="${href}" data-route="${key}">${svgIcon(ICONS[icon])}<span>${label}</span></a>`;

export function initDesktopNav(currentRoute) {
  const desktopSide = document.querySelector('.side');
  if (!desktopSide) return;

  desktopSide.innerHTML = `
    <a class="brand" href="index.html" aria-label="EGC Ingeniería, inicio">
      <span class="brand-mark">${svgIcon(ICONS.mark, '')}</span><span class="brand-copy">EGC<small>INGENIERÍA</small></span>
    </a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-nav">${svgIcon(ICONS.menu)}<span>Menú</span></button>
    <nav class="primary-nav" id="primary-nav" aria-label="Navegación principal">
      <div class="primary-nav-inner">
        <div class="nav-label">Plataforma</div>
        <section class="nav-group" data-nav-group="operacion">
          <button class="nav-group-toggle" type="button" aria-expanded="false" aria-controls="nav-operacion">${svgIcon(ICONS.grid)}<span>Operación</span>${svgIcon(ICONS.chevron, 'nav-chevron')}</button>
          <div class="nav-collapse" id="nav-operacion"><div class="nav-clip"><div class="nav-links">
            ${buildNavLink('panel.html', 'Panel', 'panel', 'panel.html')}
            ${buildNavLink('asignacion.html', 'Nueva asignación', 'add', 'asignacion.html')}
            ${buildNavLink('detalle.html', 'Sitios', 'sites', 'detalle.html')}
            <a class="nav-link nav-link-disabled" aria-disabled="true" title="Disponible en la V2">${svgIcon(ICONS.panel)}<span>Calendario · V2</span></a>
          </div></div></div>
        </section>
        <section class="nav-group" data-nav-group="control">
          <button class="nav-group-toggle" type="button" aria-expanded="false" aria-controls="nav-control">${svgIcon(ICONS.control)}<span>Control</span>${svgIcon(ICONS.chevron, 'nav-chevron')}</button>
          <div class="nav-collapse" id="nav-control"><div class="nav-clip"><div class="nav-links">
            ${buildNavLink('revisor.html', 'Revisión', 'review', 'revisor.html')}
          </div></div></div>
        </section>
      </div>
    </nav>
    <div class="side-bottom"><strong>${currentRoute === 'revisor.html' ? 'Revisor' : 'Jefe de área'}</strong>Sesión de demostración · Google</div>`;

  desktopSide.querySelectorAll('.nav-link[data-route]').forEach(a => {
    if (a.dataset.route === currentRoute) {
      a.setAttribute('aria-current', 'page');
      a.closest('.nav-group')?.classList.add('is-open');
    }
  });

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

export function initMobileNav(currentRoute) {
  const mobileBar = document.querySelector('.mov .bar');
  if (!mobileBar) return;

  const role = mobileBar.querySelector('small')?.textContent.trim().split('·')[0].trim() || 'Equipo';
  const links = [
    ['panel.html', 'Panel de sitios'],
    ['asignacion.html', 'Nueva asignación'],
    ['detalle.html', 'Detalle del sitio'],
    ['revisor.html', 'Revisión'],
    ['terreno.html', 'Mis visitas · terreno'],
    ['dibujante.html', 'Mis planos · dibujo']
  ];

  mobileBar.innerHTML = `<div class="mobile-brand"><span class="brand-mark">${svgIcon(ICONS.mark, '')}</span><span>EGC <em>Ingeniería</em><small>${role} · <a href="login.html">Salir</a></small></span></div><button class="mobile-menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu">${svgIcon(ICONS.menu, '')}<span>Secciones</span></button>`;

  const menu = document.createElement('nav');
  menu.className = 'mobile-menu';
  menu.id = 'mobile-menu';
  menu.setAttribute('aria-label', 'Secciones del prototipo');
  menu.innerHTML = `<div class="mobile-menu-clip"><div class="mobile-menu-links">${links.map(([href, label]) => `<a href="${href}"${currentRoute === href ? ' aria-current="page"' : ''}>${label}</a>`).join('')}</div></div>`;
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
    if (row.hasAttribute('onclick')) {
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