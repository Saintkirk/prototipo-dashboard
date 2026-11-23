(() => {
  const current = location.pathname.split('/').pop() || 'index.html';
  const svg = (paths, cls = 'nav-icon') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
  const icons = {
    mark: '<path d="M12 2.8 19 6v6.2c0 4.4-2.9 7.4-7 9-4.1-1.6-7-4.6-7-9V6z"/><path d="m8.5 12 2.1 2.1 5-5"/><circle cx="12" cy="12" r="8.6"/>',
    grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.4"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.4"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.4"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.4"/>',
    control: '<path d="M4 4h16v12H4z"/><path d="M8 20h8M12 16v4M8 8h8M8 12h5"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    panel: '<path d="M4 4h16v16H4z"/><path d="M4 10h16M10 10v10"/>',
    add: '<path d="M12 5v14M5 12h14"/>',
    sites: '<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    review: '<path d="M8 4h10v16H6V6h2z"/><path d="M9 10h6M9 14h6M9 17h4"/>',
    plan: '<path d="m4 17 8-10 8 10M7 17h10M10 13l2 2 4-5"/>'
  };
  const link = (href, label, icon, key) => `<a class="nav-link" href="${href}" data-route="${key}">${svg(icons[icon])}<span>${label}</span></a>`;
  const desktopSide = document.querySelector('.side');
  if (desktopSide) {
    desktopSide.innerHTML = `
      <a class="brand" href="index.html" aria-label="EGC Ingeniería, inicio">
        <span class="brand-mark">${svg(icons.mark, '')}</span><span class="brand-copy">EGC<small>INGENIERÍA</small></span>
      </a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-nav">${svg(icons.menu)}<span>Menú</span></button>
      <nav class="primary-nav" id="primary-nav" aria-label="Navegación principal">
        <div class="primary-nav-inner">
          <div class="nav-label">Plataforma</div>
          <section class="nav-group" data-nav-group="operacion">
            <button class="nav-group-toggle" type="button" aria-expanded="false" aria-controls="nav-operacion">${svg(icons.grid)}<span>Operación</span>${svg(icons.chevron, 'nav-chevron')}</button>
            <div class="nav-collapse" id="nav-operacion"><div class="nav-clip"><div class="nav-links">
              ${link('p2_panel.html', 'Panel', 'panel', 'p2_panel.html')}
              ${link('p3_asignacion.html', 'Nueva asignación', 'add', 'p3_asignacion.html')}
              ${link('p4_detalle.html', 'Sitios', 'sites', 'p4_detalle.html')}
              <a class="nav-link nav-link-disabled" aria-disabled="true" title="Disponible en la V2">${svg(icons.panel)}<span>Calendario · V2</span></a>
            </div></div></div>
          </section>
          <section class="nav-group" data-nav-group="control">
            <button class="nav-group-toggle" type="button" aria-expanded="false" aria-controls="nav-control">${svg(icons.control)}<span>Control</span>${svg(icons.chevron, 'nav-chevron')}</button>
            <div class="nav-collapse" id="nav-control"><div class="nav-clip"><div class="nav-links">
              ${link('p5_revisor.html', 'Revisión', 'review', 'p5_revisor.html')}
            </div></div></div>
          </section>
        </div>
      </nav>
      <div class="side-bottom"><strong>${current === 'p5_revisor.html' ? 'Revisor' : 'Jefe de área'}</strong>Sesión de demostración · Google</div>`;

    desktopSide.querySelectorAll('.nav-link[data-route]').forEach(a => {
      if (a.dataset.route === current) {
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
    addEventListener('resize', syncNav, {passive: true});
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

  const mobileBar = document.querySelector('.mov .bar');
  if (mobileBar) {
    const role = mobileBar.querySelector('small')?.textContent.trim().split('·')[0].trim() || 'Equipo';
    const links = [
      ['p2_panel.html', 'Panel de sitios'], ['p3_asignacion.html', 'Nueva asignación'],
      ['p4_detalle.html', 'Detalle del sitio'], ['p5_revisor.html', 'Revisión'],
      ['p6_terreno.html', 'Mis visitas · terreno'], ['p6_dibujante.html', 'Mis planos · dibujo']
    ];
    mobileBar.innerHTML = `<div class="mobile-brand"><span class="brand-mark">${svg(icons.mark, '')}</span><span>EGC <em>Ingeniería</em><small>${role} · <a href="p1_login.html">Salir</a></small></span></div><button class="mobile-menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu">${svg(icons.menu, '')}<span>Secciones</span></button>`;
    const menu = document.createElement('nav');
    menu.className = 'mobile-menu';
    menu.id = 'mobile-menu';
    menu.setAttribute('aria-label', 'Secciones del prototipo');
    menu.innerHTML = `<div class="mobile-menu-clip"><div class="mobile-menu-links">${links.map(([href, label]) => `<a href="${href}"${current === href ? ' aria-current="page"' : ''}>${label}</a>`).join('')}</div></div>`;
    mobileBar.insertAdjacentElement('afterend', menu);
    const toggle = mobileBar.querySelector('.mobile-menu-toggle');
    const setMenu = open => {
      toggle.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('is-open', open);
      menu.setAttribute('aria-hidden', String(!open));
      menu.inert = !open;
    };
    setMenu(false);
    toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); } });
  }

  document.querySelectorAll('table.res tbody tr').forEach(row => {
    const labels = [...document.querySelectorAll('table.res thead th')].map(th => th.textContent.trim());
    [...row.cells].forEach((cell, i) => { if (labels[i]) cell.dataset.label = labels[i]; });
    if (row.hasAttribute('onclick')) { row.tabIndex = 0; row.setAttribute('role', 'link'); row.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); row.click(); } }); }
  });
})();
