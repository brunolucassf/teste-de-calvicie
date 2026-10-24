/* ============================================================
   RESULT PROFILE — Preenche o "Seu Perfil Capilar" com os achados
   reais do usuário, alertas clínicos e a exceção de redução de testa.
   A API não devolve nenhum dado de identificação.
   ============================================================ */

(function () {
  'use strict';

  const LEVEL_PAGES = {
    leve: '/calvicie-leve.html',
    moderado: '/calvicie-moderada.html',
    avancado: '/calvicie-avancada.html'
  };

  const token = new URLSearchParams(window.location.search).get('t');
  if (!token) return;

  function createElement(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text) el.textContent = text;
    return el;
  }

  function renderFindings(result) {
    if (!result.findingsText) return;
    document.getElementById('profile-findings-text').textContent = result.findingsText;
    document.getElementById('profile-findings').hidden = false;
  }

  function renderAlerts(alerts) {
    if (!alerts || !alerts.length) return;
    const container = document.getElementById('profile-alerts');
    alerts.forEach(alert => {
      const box = createElement('div', `profile-alert${alert.isPriority ? ' profile-alert--priority' : ''}`);
      box.setAttribute('role', 'note');
      box.appendChild(createElement('strong', 'profile-alert__title', alert.title));
      box.appendChild(createElement('p', 'profile-alert__text', alert.text));
      container.appendChild(box);
    });
    container.hidden = false;
  }

  // Objetivo de redução de testa sem perda relevante: não forçar a narrativa de calvície (Anexo Técnico, item 7).
  function renderForeheadException(result) {
    if (!result.isForeheadException) return;
    document.getElementById('profile-title').textContent = result.foreheadMessage;
    document.getElementById('profile-scale').hidden = true;
    document.getElementById('profile-text').hidden = true;
  }

  async function loadResult() {
    try {
      const response = await fetch(`/api/quiz/result/${encodeURIComponent(token)}`, { cache: 'no-store' });
      if (!response.ok) return;
      const { result } = await response.json();

      const pageLevel = document.body.getAttribute('data-level');
      if (result.level !== pageLevel && LEVEL_PAGES[result.level]) {
        window.location.replace(`${LEVEL_PAGES[result.level]}?t=${encodeURIComponent(token)}`);
        return;
      }

      renderForeheadException(result);
      renderFindings(result);
      renderAlerts(result.alerts);
    } catch (_) {
      // Sem conexão: a página mantém o texto-base do perfil.
    }
  }

  loadResult();
})();
