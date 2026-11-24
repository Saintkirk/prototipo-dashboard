export function initReviewFlow() {
  const reviewHeadingSpan = document.querySelector('#resultado-revision b + span');
  const reviewCard = document.getElementById('resultado-revision');
  if (!reviewCard || !reviewHeadingSpan) return;

  const rows = [...document.querySelectorAll('table.res tbody tr')];

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

  rows.forEach(tr => {
    const reviewBtn = tr.querySelector('a.btn');
    if (!reviewBtn) return;

    reviewBtn.addEventListener('click', e => {
      e.preventDefault();
      selectRowForReview(tr, true);
    });
  });

  const firstReviewableRow = rows.find(tr => tr.querySelector('a.btn'));
  if (firstReviewableRow) {
    selectRowForReview(firstReviewableRow, false);
  }

  const approveBtn = reviewCard.querySelector('a.btn.ok');
  const observeBtn = reviewCard.querySelector('a.btn.g');

  approveBtn?.addEventListener('click', e => {
    e.preventDefault();
    feedbackEl.style.display = 'block';
    feedbackEl.textContent = `Aprobado ${reviewHeadingSpan.textContent}: informe validado; el jefe puede asignar dibujante para pasar a «En dibujo».`;
  });

  observeBtn?.addEventListener('click', e => {
    e.preventDefault();
    feedbackEl.style.display = 'block';
    feedbackEl.textContent = `Observación registrada ${reviewHeadingSpan.textContent}: el informe queda con observaciones y el sitio vuelve a «Visitado» para corrección.`;
  });
}