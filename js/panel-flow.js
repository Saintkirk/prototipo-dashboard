export function initPanelFlow() {
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