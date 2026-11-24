import { obtenerSitio, revisarInforme } from './store.js';
import { ROLES } from './roles.js';
import { avisoTransicion, avisoRechazo, esc } from './ui.js';

export function initReviewFlow(rol = 'revisor') {
  const reviewHeadingSpan = document.querySelector('#resultado-revision b + span');
  const reviewCard = document.getElementById('resultado-revision');
  if (!reviewCard || !reviewHeadingSpan) return;

  const rows = [...document.querySelectorAll('table.res tbody tr')];
  const idDeFila = tr => tr.cells[0]?.textContent.match(/\d{4}/)?.[0];
  const contador = document.querySelector('.filtros > div b');

  // Las filas reflejan el estado real: lo ya aprobado o devuelto a terreno deja de estar «listo para revisar»
  const sincronizarFilas = () => {
    rows.forEach(tr => {
      const sitio = obtenerSitio(idDeFila(tr));
      const celda = tr.cells[tr.cells.length - 1];
      if (!sitio || !tr.querySelector('a.btn')) return;
      if (sitio.estado < 3) {
        celda.innerHTML = '<span class="waiting">Devuelto a terreno</span>';
      } else if (sitio.revision?.resultado === 'aprobado') {
        celda.innerHTML = `<span class="ok-texto">Aprobado ${esc(sitio.revision.fecha)}</span>`;
      }
    });
    if (contador) contador.textContent = rows.filter(tr => tr.querySelector('a.btn')).length;
  };
  sincronizarFilas();

  // Resumen contextual al cargar un sitio para revisión
  let summaryEl = reviewCard.querySelector('.review-site-summary');
  if (!summaryEl) {
    summaryEl = document.createElement('div');
    summaryEl.className = 'review-site-summary';
    summaryEl.style.marginTop = '8px';
    summaryEl.style.padding = '8px 10px';
    summaryEl.style.borderRadius = '6px';
    summaryEl.style.background = '#f4f6f8';
    summaryEl.style.fontSize = '12px';
    summaryEl.style.color = '#334e68';
    summaryEl.textContent = 'Selecciona «Revisar» en un sitio completo para cargar su documentación y emitir tu dictamen.';
    const actionsRow = reviewCard.querySelector('div[style*="display:flex"]');
    reviewCard.insertBefore(summaryEl, actionsRow || null);
  }

  // Mensaje de resultado al Aprobar o Registrar observación
  let feedbackEl = reviewCard.querySelector('.review-feedback');
  if (!feedbackEl) {
    feedbackEl = document.createElement('div');
    feedbackEl.className = 'warn review-feedback';
    feedbackEl.style.marginTop = '10px';
    feedbackEl.style.display = 'none';
    reviewCard.appendChild(feedbackEl);
  }

  const formatContentLower = contentText => {
    if (!contentText) return 'documentación cargada';
    return contentText.charAt(0).toLowerCase() + contentText.slice(1);
  };

  const selectRowForReview = (tr, shouldScroll = false) => {
    const siteText = tr.cells[0]?.textContent.trim() || '';
    const clientText = tr.cells[1]?.textContent.trim() || '';
    const contentText = tr.cells[2]?.textContent.trim() || '';
    const completionText = tr.cells[3]?.textContent.trim() || '';

    rows.forEach(r => r.classList.remove('is-selected-review'));
    tr.classList.add('is-selected-review');

    reviewHeadingSpan.textContent = `(sitio ${siteText})`;
    summaryEl.innerHTML =
      `<b>Cargado para revisión:</b> sitio ${siteText} (${clientText}). ` +
      `Documentación disponible: ${formatContentLower(contentText)} (${completionText}). ` +
      `Revisa los antecedentes y selecciona <b>Aprobar</b> o <b>Registrar observación</b>.`;

    feedbackEl.style.display = 'none';
    feedbackEl.textContent = '';

    if (shouldScroll) {
      reviewCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const filasRevisables = () => rows.filter(tr => tr.querySelector('a.btn'));

  rows.forEach(tr => {
    const reviewBtn = tr.querySelector('a.btn');
    if (!reviewBtn) return;

    reviewBtn.addEventListener('click', e => {
      e.preventDefault();
      selectRowForReview(tr, true);
    });
  });

  const firstReviewableRow = filasRevisables()[0];
  if (firstReviewableRow) {
    selectRowForReview(firstReviewableRow, false);
  }

  const approveBtn = reviewCard.querySelector('a.btn.ok');
  const observeBtn = reviewCard.querySelector('a.btn.g');
  const comentario = () => reviewCard.querySelector('.in')?.textContent.replace(/^Comentario:\s*/, '').trim() ?? '';
  const sitioSeleccionado = () => reviewHeadingSpan.textContent.match(/\d{4}/)?.[0];

  const revisar = (resultado, textoExito) => {
    const r = revisarInforme(sitioSeleccionado(), resultado, comentario());
    feedbackEl.style.display = 'block';
    if (!r.ok) {
      feedbackEl.textContent = `No se pudo registrar ${reviewHeadingSpan.textContent}: ${r.error}`;
      avisoRechazo(r.error, ROLES[rol].etiqueta);
      return;
    }
    feedbackEl.textContent = `${textoExito} ${reviewHeadingSpan.textContent}`;
    sincronizarFilas();
    avisoTransicion(r, ROLES[rol].etiqueta);
  };

  approveBtn?.addEventListener('click', e => {
    e.preventDefault();
    revisar('aprobar', 'Aprobado: informe validado; el jefe ya puede asignar dibujante para pasar a «En dibujo».');
  });

  observeBtn?.addEventListener('click', e => {
    e.preventDefault();
    revisar('observar', 'Observación registrada: el sitio vuelve a «Visitado» para corrección de terreno.');
  });
}
