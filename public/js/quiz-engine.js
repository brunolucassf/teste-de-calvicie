/* ============================================================
   QUIZ ENGINE — Teste de Perfil Capilar
   Interface do questionário. Perguntas, regras e resultado vêm de quiz-definition.js.
   ============================================================ */

(function () {
  'use strict';

  const Quiz = window.QuizDefinition;
  const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const AUTO_ADVANCE_DELAY_MS = 350;
  const CARD_TRANSITION_MS = 300;
  const PROCESSING_STEP_MS = 450;
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const state = {
    step: 'intro',
    index: 0,
    answers: {},
    consents: null,
    isTransitioning: false
  };

  const stage = document.getElementById('quiz-stage');
  const quizApp = document.getElementById('quiz-app');
  const processingScreen = document.getElementById('processing-screen');
  const progressWrap = document.getElementById('progress-wrap');
  const progressBar = document.getElementById('progress-bar');
  const progressFill = document.getElementById('progress-fill');
  const progressText = document.getElementById('progress-text');

  // ===== Helpers =====
  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getQuestions() {
    return Quiz.getVisibleQuestions(state.answers);
  }

  function getCurrentQuestion() {
    return getQuestions()[state.index];
  }

  function setProgress(percent, label) {
    progressWrap.hidden = false;
    progressFill.style.width = percent + '%';
    progressBar.setAttribute('aria-valuenow', String(percent));
    progressText.textContent = label;
  }

  function focusHeading() {
    const heading = stage.querySelector('[data-focus]');
    if (heading) heading.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function animateCardOut(direction, callback) {
    const card = stage.querySelector('.question-card');
    if (!card) return callback();
    state.isTransitioning = true;
    card.classList.add(direction === 'back' ? 'exit-right' : 'exit-left');
    setTimeout(() => {
      state.isTransitioning = false;
      callback();
    }, CARD_TRANSITION_MS);
  }

  function preloadImages(question) {
    if (!question || question.layout !== 'image') return;
    question.options.forEach(option => {
      const img = new Image();
      img.src = option.image;
    });
  }

  function trackEvent(eventName, params) {
    // Somente eventos técnicos de navegação: nenhuma resposta de saúde é enviada a terceiros (LGPD art. 11).
    if (typeof fbq === 'function') fbq('trackCustom', eventName, params || {});
    if (typeof gtag === 'function') gtag('event', eventName, params || {});
  }

  // Respostas que deixam de valer quando uma resposta anterior muda (ex.: troca de sexo na Q1).
  function pruneDependentAnswers() {
    Quiz.getVisibleQuestions(state.answers).forEach(question => {
      const validIds = Quiz.getVisibleOptions(question, state.answers).map(o => o.id);
      const value = state.answers[question.id];
      if (Array.isArray(value)) {
        state.answers[question.id] = value.filter(id => validIds.includes(id));
        if (!state.answers[question.id].length) delete state.answers[question.id];
      } else if (value !== undefined && !validIds.includes(value)) {
        delete state.answers[question.id];
      }
    });
    if (state.answers.q16 === 'nunca') delete state.answers.q17;
  }

  // ===== Tela inicial + consentimento (antes de qualquer dado de saúde) =====
  function renderIntro() {
    state.step = 'intro';
    progressWrap.hidden = true;

    stage.innerHTML = `
      <section class="question-card quiz-intro">
        <span class="question-card__category">Teste de Perfil Capilar</span>
        <h1 class="quiz-intro__title" tabindex="-1" data-focus>Descubra o que seu cabelo pode estar mostrando</h1>
        <p class="quiz-intro__text">Responda a algumas perguntas sobre seu cabelo e receba uma análise educativa do seu perfil capilar.</p>
        <p class="quiz-intro__time">Leva cerca de 2 minutos.</p>
        <p class="quiz-disclaimer">${escapeHtml(Quiz.DISCLAIMER)}</p>

        <form class="consent-form" id="consent-form" novalidate>
          <div class="consent-box consent-box--highlight">
            <label class="consent-check" for="consent-sensitive">
              <input type="checkbox" id="consent-sensitive">
              <span>
                <strong>Autorizo o tratamento dos meus dados pessoais sensíveis de saúde</strong>
                (minhas respostas sobre o cabelo) para a realização desta avaliação capilar, nos termos do
                <a href="/termo-consentimento-lgpd" target="_blank" rel="noopener">Termo de Consentimento LGPD</a>.
              </span>
            </label>
          </div>
          <label class="consent-check" for="consent-adult">
            <input type="checkbox" id="consent-adult">
            <span>Declaro ter 18 anos ou mais.</span>
          </label>
          <p class="form-error" id="consent-error" role="alert"></p>
          <button type="submit" class="btn btn--gold btn--lg btn--block" id="btn-start-quiz">Começar meu teste</button>
          <p class="consent-footnote">
            Seus dados não são comercializados. Consulte também os <a href="/termos-de-uso" target="_blank" rel="noopener">Termos de Uso</a>.
          </p>
        </form>
      </section>
    `;

    document.getElementById('consent-form').addEventListener('submit', handleConsentSubmit);
    focusHeading();
  }

  function handleConsentSubmit(event) {
    event.preventDefault();
    const hasSensitiveConsent = document.getElementById('consent-sensitive').checked;
    const isAdult = document.getElementById('consent-adult').checked;
    const errorEl = document.getElementById('consent-error');

    if (!hasSensitiveConsent || !isAdult) {
      errorEl.textContent = !hasSensitiveConsent
        ? 'Para realizar a avaliação precisamos do seu consentimento para tratar as respostas sobre o seu cabelo.'
        : 'O teste é destinado a maiores de 18 anos.';
      return;
    }

    state.consents = { sensitiveData: true, adulthood: true, acceptedAt: new Date().toISOString() };
    trackEvent('QuizStart');
    animateCardOut('next', () => goToQuestion(0));
  }

  // ===== Perguntas =====
  function goToQuestion(index) {
    state.step = 'question';
    state.index = index;
    renderQuestion();
  }

  function renderOption(question, option, i) {
    const value = state.answers[question.id];
    const isSelected = Array.isArray(value) ? value.includes(option.id) : value === option.id;
    const role = question.multiple ? 'checkbox' : 'radio';

    if (question.layout === 'image') {
      return `
        <button type="button" class="option-card ${isSelected ? 'selected' : ''}" role="${role}" aria-checked="${isSelected}" data-option="${option.id}">
          <span class="option-card__media">
            <img src="${option.image}" alt="" width="180" height="200" decoding="async">
            <span class="option-card__check" aria-hidden="true"></span>
          </span>
          <span class="option-card__label">${escapeHtml(option.text)}</span>
          ${option.caption ? `<span class="option-card__caption">${escapeHtml(option.caption)}</span>` : ''}
        </button>
      `;
    }

    return `
      <button type="button" class="option-btn ${isSelected ? 'selected' : ''} ${question.multiple ? 'option-btn--multi' : ''}" role="${role}" aria-checked="${isSelected}" data-option="${option.id}">
        <span class="option-letter" aria-hidden="true">${LETTERS[i]}</span>
        <span class="option-radio" aria-hidden="true"></span>
        <span class="option-text">${escapeHtml(option.text)}</span>
      </button>
    `;
  }

  function renderQuestion() {
    const questions = getQuestions();
    const question = questions[state.index];
    const options = Quiz.getVisibleOptions(question, state.answers);
    const position = state.index + 1;
    const isImage = question.layout === 'image';

    setProgress(Math.round((position / questions.length) * 100), `Pergunta ${position} de ${questions.length}`);

    stage.innerHTML = `
      <section class="question-card ${isImage ? 'question-card--wide' : ''}">
        <span class="question-card__category">${escapeHtml(Quiz.STAGES[question.stage])}</span>
        <p class="question-card__number">Pergunta ${position} de ${questions.length}</p>
        <h2 class="question-card__title" id="question-title" tabindex="-1" data-focus>${escapeHtml(question.title)}</h2>
        ${question.subtitle ? `<p class="question-card__subtitle">${escapeHtml(question.subtitle)}</p>` : ''}
        <div class="${isImage ? `options-grid options-grid--${options.length}` : 'options-list'}" role="${question.multiple ? 'group' : 'radiogroup'}" aria-labelledby="question-title">
          ${options.map((option, i) => renderOption(question, option, i)).join('')}
        </div>
        ${question.multiple ? `
          <button type="button" class="btn btn--gold btn--block quiz-continue" id="btn-continue" ${state.answers[question.id] ? '' : 'disabled'}>Continuar</button>
        ` : ''}
        <div class="quiz-nav">
          <button type="button" class="quiz-nav__back" id="btn-back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>
            Voltar
          </button>
        </div>
      </section>
    `;

    stage.querySelectorAll('[data-option]').forEach(btn => {
      btn.addEventListener('click', () => handleOptionClick(question, btn.dataset.option));
    });
    document.getElementById('btn-back').addEventListener('click', handleBack);
    const continueBtn = document.getElementById('btn-continue');
    if (continueBtn) continueBtn.addEventListener('click', goNext);

    preloadImages(questions[state.index + 1]);
    focusHeading();
  }

  function handleOptionClick(question, optionId) {
    if (state.isTransitioning) return;
    if (question.multiple) return toggleMultiOption(question, optionId);

    state.answers[question.id] = optionId;
    pruneDependentAnswers();
    stage.querySelectorAll('[data-option]').forEach(btn => {
      const isSelected = btn.dataset.option === optionId;
      btn.classList.toggle('selected', isSelected);
      btn.setAttribute('aria-checked', String(isSelected));
    });
    setTimeout(goNext, AUTO_ADVANCE_DELAY_MS);
  }

  function toggleMultiOption(question, optionId) {
    const option = question.options.find(o => o.id === optionId);
    let selected = state.answers[question.id] || [];

    if (selected.includes(optionId)) {
      selected = selected.filter(id => id !== optionId);
    } else if (option.exclusive) {
      selected = [optionId];
    } else {
      const exclusiveIds = question.options.filter(o => o.exclusive).map(o => o.id);
      selected = selected.filter(id => !exclusiveIds.includes(id)).concat(optionId);
    }

    if (selected.length) state.answers[question.id] = selected;
    else delete state.answers[question.id];

    stage.querySelectorAll('[data-option]').forEach(btn => {
      const isSelected = selected.includes(btn.dataset.option);
      btn.classList.toggle('selected', isSelected);
      btn.setAttribute('aria-checked', String(isSelected));
    });
    document.getElementById('btn-continue').disabled = !selected.length;
  }

  function isQuestionAnswered(question) {
    const value = state.answers[question.id];
    return question.multiple ? Array.isArray(value) && value.length > 0 : value !== undefined;
  }

  function goNext() {
    const questions = getQuestions();
    if (!isQuestionAnswered(questions[state.index])) return;
    trackEvent('QuizStep', { step: state.index + 1 });
    if (state.index < questions.length - 1) {
      animateCardOut('next', () => goToQuestion(state.index + 1));
    } else {
      animateCardOut('next', showProcessing);
    }
  }

  function handleBack() {
    if (state.isTransitioning) return;
    if (state.index === 0) return animateCardOut('back', renderIntro);
    animateCardOut('back', () => goToQuestion(state.index - 1));
  }

  // ===== Processamento =====
  function showProcessing() {
    state.step = 'processing';
    quizApp.hidden = true;
    processingScreen.hidden = false;
    window.scrollTo({ top: 0 });

    const items = processingScreen.querySelectorAll('#processing-checklist li');
    items.forEach(item => item.classList.remove('done'));
    items.forEach((item, i) => setTimeout(() => item.classList.add('done'), (i + 1) * PROCESSING_STEP_MS));

    setTimeout(() => {
      processingScreen.hidden = true;
      quizApp.hidden = false;
      renderLeadCapture();
    }, (items.length + 1) * PROCESSING_STEP_MS + 300);
  }

  // ===== "Seu perfil capilar está pronto" + dados de contato =====
  function renderLeadCapture() {
    state.step = 'lead';
    setProgress(100, 'Seu perfil está pronto');

    stage.innerHTML = `
      <section class="question-card lead-capture">
        <span class="question-card__category">Análise concluída</span>
        <h2 class="lead-capture__title" tabindex="-1" data-focus>Seu perfil capilar está pronto</h2>
        <p class="lead-capture__subtitle">Informe seus dados para ver o resultado da sua análise educativa.</p>

        <form class="lead-capture__form" id="lead-form" novalidate>
          <div class="input-group">
            <label for="lead-name">Nome completo *</label>
            <input type="text" id="lead-name" class="input-field" placeholder="Seu nome completo" required autocomplete="name" maxlength="120">
            <span class="input-error-msg" id="error-name" role="alert"></span>
          </div>

          <div class="input-group">
            <label for="lead-email">E-mail *</label>
            <input type="email" id="lead-email" class="input-field" placeholder="seu@email.com" required autocomplete="email" maxlength="160">
            <span class="input-error-msg" id="error-email" role="alert"></span>
          </div>

          <div class="input-group">
            <label for="lead-phone">WhatsApp <span class="input-optional">(opcional)</span></label>
            <input type="tel" id="lead-phone" class="input-field" placeholder="(00) 00000-0000" autocomplete="tel" inputmode="tel" maxlength="15">
            <span class="input-error-msg" id="error-phone" role="alert"></span>
          </div>

          <label class="consent-check" for="lead-marketing">
            <input type="checkbox" id="lead-marketing">
            <span>Autorizo o uso dos meus dados de contato para o recebimento de comunicações, conteúdos e ofertas do Controlador. <em>(opcional)</em></span>
          </label>

          <p class="form-error" id="lead-error" role="alert"></p>
          <button type="submit" class="btn btn--gold btn--lg btn--block" id="btn-submit-lead">Ver meu perfil capilar</button>
          <p class="consent-footnote">${escapeHtml(Quiz.DISCLAIMER)}</p>
        </form>

        <div class="quiz-nav">
          <button type="button" class="quiz-nav__back" id="btn-back-lead">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>
            Voltar às perguntas
          </button>
        </div>
      </section>
    `;

    document.getElementById('lead-phone').addEventListener('input', handlePhoneMask);
    document.getElementById('lead-form').addEventListener('submit', handleLeadSubmit);
    document.getElementById('btn-back-lead').addEventListener('click', () => goToQuestion(getQuestions().length - 1));
    focusHeading();
  }

  function handlePhoneMask(event) {
    let digits = event.target.value.replace(/\D/g, '').slice(0, 11);
    if (digits.length > 6) digits = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    else if (digits.length > 2) digits = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    event.target.value = digits;
  }

  function setFieldError(fieldId, message) {
    document.getElementById(`error-${fieldId}`).textContent = message;
    document.getElementById(`lead-${fieldId}`).classList.toggle('error', Boolean(message));
  }

  async function handleLeadSubmit(event) {
    event.preventDefault();
    const name = document.getElementById('lead-name').value.trim();
    const email = document.getElementById('lead-email').value.trim();
    const phone = document.getElementById('lead-phone').value.trim();
    const isMarketingOptIn = document.getElementById('lead-marketing').checked;
    const errorEl = document.getElementById('lead-error');
    const submitBtn = document.getElementById('btn-submit-lead');

    const isNameValid = name.length >= 3;
    const isEmailValid = EMAIL_REGEX.test(email);
    setFieldError('name', isNameValid ? '' : 'Por favor, insira seu nome completo.');
    setFieldError('email', isEmailValid ? '' : 'Insira um e-mail válido.');
    const phoneDigits = phone.replace(/\D/g, '');
    // Opcional: vazio é aceito; preenchido, precisa ter DDD + número.
    const isPhoneValid = phoneDigits.length === 0 || phoneDigits.length === 10 || phoneDigits.length === 11;
    setFieldError('phone', isPhoneValid ? '' : 'Insira um WhatsApp válido com DDD ou deixe em branco.');
    if (!isNameValid || !isEmailValid || !isPhoneValid) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Gerando seu resultado...';
    errorEl.textContent = '';

    const leadEventId = window.MetaTracking ? MetaTracking.newEventId('lead') : null;
    try {
      const response = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: state.answers,
          lead: { name, email, phone },
          consents: { ...state.consents, marketing: isMarketingOptIn },
          meta: window.MetaTracking ? MetaTracking.serverContext(leadEventId) : null
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error(data.error || 'Não foi possível gerar seu resultado.');

      trackEvent('QuizCompleted');
      if (window.MetaTracking) MetaTracking.track('Lead', {}, leadEventId);
      // Guarda nome, e-mail e WhatsApp só nesta aba do navegador (sessionStorage) para pré-preencher o checkout.
      // Não vai na URL nem passa por servidor, então não expõe dados pessoais em links ou histórico.
      try { sessionStorage.setItem('tc_checkout_prefill', JSON.stringify({ name, email, phone })); } catch (_) { /* navegação privada: segue sem pré-preencher */ }
      window.location.href = `${data.redirectUrl}?t=${encodeURIComponent(data.sessionToken)}`;
    } catch (err) {
      errorEl.textContent = err.message || 'Erro de conexão. Tente novamente.';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Ver meu perfil capilar';
    }
  }

  // ===== Teclado: letras A–G escolhem opções nas perguntas de texto =====
  document.addEventListener('keydown', (event) => {
    if (state.step !== 'question' || event.target.closest('input, textarea, select')) return;
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const letterIndex = LETTERS.indexOf(event.key.toUpperCase());
    if (letterIndex < 0) return;
    const buttons = stage.querySelectorAll('[data-option]');
    if (buttons[letterIndex]) buttons[letterIndex].click();
  });

  renderIntro();
})();
