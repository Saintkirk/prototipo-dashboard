import { listarSitios, contarPorEstado } from './store.js';
import { urlPara } from './roles.js';
import { chip, esc, mostrarAviso } from './ui.js';

// La tabla y los contadores salen del estado del demo: así reflejan las transiciones y los sitios nuevos
function renderizarPanel(rol) {
  const tbody = document.querySelector('table.res tbody');
  if (!tbody) return;
  tbody.innerHTML = listarSitios().map(s => `
            <tr class="clic" data-sitio="${esc(s.id)}">
              <td><b>${esc(s.id)}</b> · ${esc(s.nombre)}</td>
              <td>${esc(s.cliente)}</td>
              <td>${esc(s.tipo)}</td>
              <td>${chip(s.estado)}</td>
              <td>${esc(s.responsable)}</td>
              <td>${s.atraso ? `<span class="late">Plazo ${s.plazo.slice(0, 5)} atraso</span>` : `Plazo ${s.plazo.slice(0, 5)}`}</td>
            </tr>`).join('');
  tbody.querySelectorAll('tr.clic').forEach(tr => {
    const ir = () => { location.href = urlPara('detalle.html', rol, { sitio: tr.dataset.sitio }); };
    tr.addEventListener('click', ir);
    tr.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ir(); } });
  });

  const conteo = contarPorEstado();
  document.querySelectorAll('.kpis .kpi b').forEach((b, i) => { b.textContent = conteo[i]; });

  const atrasados = listarSitios().filter(s => s.atraso).length;
  const aviso = [...document.querySelectorAll('.filtros .warn')].find(el => el.textContent.toLowerCase().includes('atraso'));
  if (aviso) aviso.textContent = `${atrasados} ${atrasados === 1 ? 'sitio con atraso' : 'sitios con atraso'}`;

  // Cierre del flujo de «Nueva asignación»: el sitio recién guardado aparece resaltado
  const nuevoId = new URLSearchParams(location.search).get('nuevo');
  const nuevo = nuevoId && listarSitios().find(s => s.id === nuevoId);
  if (nuevo) {
    tbody.querySelector(`tr[data-sitio="${CSS.escape(nuevo.id)}"]`)?.classList.add('is-new');
    mostrarAviso({
      titulo: `Sitio ${nuevo.id} · ${nuevo.nombre}`,
      texto: 'Asignación registrada en <b>Recibido</b>',
      detalle: 'Ya figura en la tabla y en el contador de estados · simulación sin backend'
    });
    history.replaceState(null, '', urlPara('panel.html', rol));
  }
}

export function initPanelFlow(rol = 'jefe') {
  renderizarPanel(rol);
  const rows = [...document.querySelectorAll('table.res tbody tr')];
  const kpis = [...document.querySelectorAll('.kpis .kpi')];
  const selects = [...document.querySelectorAll('.filtros .in')];
  if (!rows.length) return;

  let activeEstadoFilter = '';
  let onlyLate = false;

  const applyPanelFilters = () => {
    const [estadoSelect, equipoSelect, clienteSelect] = selects;
    const estadoVal = (activeEstadoFilter || estadoSelect?.value || '').toLowerCase();
    const equipoVal = (equipoSelect?.value || '').toLowerCase();
    const clienteVal = (clienteSelect?.value || '').toLowerCase();

    rows.forEach(tr => {
      const text = tr.textContent.toLowerCase();
      const isLateRow = Boolean(tr.querySelector('.late'));
      const matchEstado = !estadoVal || estadoVal.includes('todos') || text.includes(estadoVal);
      const matchEquipo = !equipoVal || equipoVal.includes('todos') || text.includes(equipoVal);
      const matchCliente = !clienteVal || clienteVal.includes('todos') || clienteVal.includes('entel y wom') || text.includes(clienteVal);
      const matchLate = !onlyLate || isLateRow;
      tr.style.display = (matchEstado && matchEquipo && matchCliente && matchLate) ? '' : 'none';
    });
  };

  kpis.forEach(kpi => {
    kpi.style.cursor = 'pointer';
    kpi.addEventListener('click', () => {
      const chipText = kpi.querySelector('.chip')?.textContent.trim().toLowerCase() || '';
      activeEstadoFilter = (activeEstadoFilter === chipText) ? '' : chipText;
      onlyLate = false;
      kpis.forEach(el => { el.style.outline = ''; });
      if (activeEstadoFilter) kpi.style.outline = '2px solid var(--rojo)';
      applyPanelFilters();
    });
  });

  selects.forEach(sel => sel.addEventListener('change', () => {
    activeEstadoFilter = '';
    kpis.forEach(el => { el.style.outline = ''; });
    applyPanelFilters();
  }));

  const lateBadge = [...document.querySelectorAll('.filtros .warn')].find(el => el.textContent.toLowerCase().includes('atraso'));
  if (lateBadge) {
    lateBadge.style.cursor = 'pointer';
    lateBadge.title = 'Filtrar sitios con atraso';
    lateBadge.addEventListener('click', () => {
      onlyLate = !onlyLate;
      lateBadge.style.outline = onlyLate ? '2px solid var(--alerta)' : '';
      applyPanelFilters();
    });
  }
}