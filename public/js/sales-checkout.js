/* ============================================================
   SALES CHECKOUT & LANDING PAGE CONTROLLER
   Teste de Calvície — Dr. Ito Meireles
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // 1. Read URL Parameters
  const params = new URLSearchParams(window.location.search);
  const tokenParam = params.get('t');

  // Preço e chave pública vêm do servidor: uma única fonte de verdade para o valor exibido e cobrado.
  // Sem valor escrito aqui: o preço nasce no servidor (painel → Produto) e chega pela API.
  const checkoutConfig = { price: null, pricing: null, maxInstallments: 3, publicKey: '' };

  function currentPriceText() {
    if (checkoutConfig.pricing) return checkoutConfig.pricing.current;
    const el = document.querySelector('[data-product-price]');
    return el ? el.textContent.trim() : '';
  }

  function renderPrices() {
    const { pricing } = checkoutConfig;
    if (!pricing) return;
    document.querySelectorAll('[data-product-price]').forEach(el => { el.textContent = pricing.current; });
    document.querySelectorAll('[data-product-price-original]').forEach(el => {
      el.textContent = pricing.original ? `De ${pricing.original}` : '';
      el.hidden = !pricing.isPromoActive;
    });
    document.querySelectorAll('[data-promo-note]').forEach(el => {
      el.textContent = pricing.promoNote;
      el.hidden = !pricing.isPromoActive;
    });
  }

  function priceChangedMessage() {
    return 'O valor do guia foi atualizado. Recarregue a página para ver o preço atual antes de pagar.';
  }

  const configReady = fetch('/api/payment/config', { cache: 'no-store' })
    .then(res => res.json())
    .then(data => {
      Object.assign(checkoutConfig, data);
      renderPrices();
    })
    .catch(() => {});

  const termsInput = document.getElementById('buyer-terms');

  function isValidPhoneNumber(value) {
    const digits = String(value).replace(/\D/g, '');
    return digits.length === 10 || digits.length === 11;
  }

  function hasAcceptedTerms() {
    if (termsInput && termsInput.checked) return true;
    alert('Para continuar, aceite os Termos de Uso e o Termo de Consentimento LGPD.');
    if (termsInput) termsInput.focus();
    return false;
  }

  // 2. Setup Video Poster / Vimeo Embed
  const videoWrapper = document.getElementById('video-wrapper');
  const videoPoster = document.getElementById('video-poster');
  if (videoWrapper && videoPoster) {
    videoPoster.addEventListener('click', () => {
      const vimeoId = (videoWrapper.getAttribute('data-vimeo-id') || '').replace(/\D/g, '');
      if (!vimeoId) return;
      const videoTitle = videoWrapper.getAttribute('data-video-title') || 'Vídeo de orientação';
      // O player só é carregado no clique (nada do Vimeo roda antes). dnt=1 pede ao Vimeo que não rastreie o visitante (LGPD).
      const iframe = document.createElement('iframe');
      iframe.src = `https://player.vimeo.com/video/${vimeoId}?autoplay=1&title=0&byline=0&portrait=0&badge=0&autopause=0&playsinline=1&dnt=1`;
      iframe.title = videoTitle;
      iframe.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
      iframe.setAttribute('allowfullscreen', '');
      iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      iframe.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;border:0;';
      videoWrapper.replaceChildren(iframe);
    });
  }

  // 3. Payment Method Toggle (Pix vs Card)
  let selectedMethod = 'pix';
  let cardBrickReady = false;
  const methodButtons = document.querySelectorAll('.payment-option-btn');
  const btnSubmit = document.getElementById('btn-sales-submit');
  const cardDetails = document.getElementById('card-fields-notice');

  methodButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      methodButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedMethod = btn.getAttribute('data-method');

      if (selectedMethod === 'pix') {
        if (btnSubmit) {
          btnSubmit.style.display = '';
          btnSubmit.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Gerar Pix para Acesso Imediato — ${currentPriceText()}
          `;
        }
        if (cardDetails) cardDetails.style.display = 'none';
      } else {
        // Card Brick owns its own submit button, hide the native one.
        if (btnSubmit) btnSubmit.style.display = 'none';
        if (cardDetails) cardDetails.style.display = 'block';
        initCardBrick();
      }
    });
  });

  // Mensagens de status do checkout (erro / sucesso / info) exibidas na própria página.
  function showCheckoutMessage(type, html) {
    let box = document.getElementById('checkout-status-msg');
    if (!box) {
      box = document.createElement('div');
      box.id = 'checkout-status-msg';
      box.setAttribute('role', 'status');
      const anchor = document.getElementById('pix-display-area') || btnSubmit;
      if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(box, anchor.nextSibling);
    }
    const colors = {
      error: ['rgba(248,113,113,0.1)', '#F87171'],
      success: ['rgba(52,211,153,0.1)', '#34D399'],
      info: ['rgba(212,175,55,0.08)', 'var(--gold-300)']
    };
    const [bg, fg] = colors[type] || colors.info;
    box.style.cssText = `margin-top:12px;padding:12px 14px;border-radius:8px;font-size:13px;line-height:1.5;background:${bg};color:${fg};border:1px solid ${fg};`;
    box.innerHTML = html;
    box.style.display = 'block';
  }

  function hideCheckoutMessage() {
    const box = document.getElementById('checkout-status-msg');
    if (box) box.style.display = 'none';
  }

  function startCheckoutTracking() {
    if (!window.MetaTracking) return null;
    const eventId = MetaTracking.newEventId('checkout');
    MetaTracking.track('InitiateCheckout', { value: checkoutConfig.price, currency: 'BRL', content_ids: [document.body.getAttribute('data-level')], content_type: 'product' }, eventId);
    return MetaTracking.serverContext(eventId);
  }

  function trackPurchase(orderId) {
    if (!window.MetaTracking || !orderId) return;
    MetaTracking.track('Purchase', { value: checkoutConfig.price, currency: 'BRL', content_ids: [document.body.getAttribute('data-level')], content_type: 'product' }, 'purchase-' + orderId);
  }

  function showPurchaseSuccess() {
    const brick = document.getElementById('card-fields-notice');
    if (brick) brick.style.display = 'none';
    if (pixContainer) pixContainer.classList.remove('show');
    if (btnSubmit) btnSubmit.style.display = 'none';
    methodButtons.forEach(b => { b.disabled = true; });
    showCheckoutMessage('success',
      '<strong>✅ Pagamento aprovado!</strong><br>Enviamos o link de acesso ao seu e-book para o e-mail informado. ' +
      'Se não encontrar, confira a caixa de spam ou promoções.');
  }

  // 3b. Mercado Pago Card Payment Brick (tokenização PCI no navegador — o cartão nunca passa pelo nosso servidor)
  async function initCardBrick() {
    if (cardBrickReady) return;

    if (typeof MercadoPago === 'undefined') {
      showCheckoutMessage('error', 'Não foi possível carregar o formulário seguro do Mercado Pago. ' +
        'Desative bloqueadores de anúncio para este site e recarregue a página, ou pague com Pix.');
      return;
    }
    cardBrickReady = true;

    try {
      await configReady;
      if (!checkoutConfig.publicKey || checkoutConfig.price === null) {
        throw new Error('Mercado Pago public key não configurada.');
      }

      const mp = new MercadoPago(checkoutConfig.publicKey, { locale: 'pt-BR' });
      const bricksBuilder = mp.bricks();

      await bricksBuilder.create('cardPayment', 'card-payment-brick-container', {
        initialization: { amount: checkoutConfig.price },
        customization: {
          visual: { style: { theme: 'dark' } },
          paymentMethods: { creditCard: 'all', debitCard: 'all', maxInstallments: checkoutConfig.maxInstallments }
        },
        callbacks: {
          onReady: () => hideCheckoutMessage(),
          onError: (error) => {
            console.error('Card Brick error:', error);
            if (error && error.type === 'critical') {
              showCheckoutMessage('error', 'Erro ao carregar o formulário de cartão. Recarregue a página ou pague com Pix.');
            }
          },
          onSubmit: (cardFormData, additionalData) => submitCardPayment(cardFormData, additionalData)
        }
      });
    } catch (err) {
      console.error('Falha ao carregar formulário de cartão:', err);
      cardBrickReady = false;
      showCheckoutMessage('error', 'Não foi possível carregar o pagamento com cartão agora. Tente novamente ou use Pix.');
    }
  }

  function getBuyerFields() {
    const nameInput = document.getElementById('buyer-name');
    const emailInput = document.getElementById('buyer-email');
    const cpfVal = cpfInput ? cpfInput.value.replace(/\D/g, '') : '';
    const phoneVal = phoneInput ? phoneInput.value.trim() : '';
    return { nameInput, emailInput, cpfVal, phoneVal };
  }

  async function submitCardPayment(cardFormData, additionalData) {
    const { nameInput, emailInput, cpfVal, phoneVal } = getBuyerFields();
    hideCheckoutMessage();

    if (!nameInput || !nameInput.value.trim()) {
      alert('Por favor, informe seu nome completo.');
      if (nameInput) nameInput.focus();
      throw new Error('missing-name');
    }
    if (!cpfVal || cpfVal.length !== 11 || !isValidCPF(cpfVal)) {
      alert('Por favor, informe um CPF válido para emissão da nota fiscal.');
      if (cpfInput) cpfInput.focus();
      throw new Error('invalid-cpf');
    }
    if (!emailInput || !emailInput.value.trim() || !emailInput.value.includes('@')) {
      alert('Por favor, informe um e-mail válido para recebimento do material.');
      if (emailInput) emailInput.focus();
      throw new Error('invalid-email');
    }
    if (!isValidPhoneNumber(phoneVal)) {
      alert('Por favor, informe um WhatsApp válido com DDD.');
      if (phoneInput) phoneInput.focus();
      throw new Error('invalid-phone');
    }
    if (!hasAcceptedTerms()) {
      throw new Error('terms-not-accepted');
    }

    const payload = {
      sessionToken: tokenParam || '',
      name: nameInput.value.trim(),
      cpf: cpfVal,
      email: emailInput.value.trim(),
      phone: phoneVal,
      level: document.body.getAttribute('data-level'),
      acceptedTerms: true,
      expectedPrice: checkoutConfig.price,
      paymentMethod: 'card',
      token: cardFormData.token,
      installments: cardFormData.installments,
      payment_method_id: cardFormData.payment_method_id,
      payment_type_id: additionalData && additionalData.paymentTypeId,
      issuer_id: cardFormData.issuer_id,
      cardholderIdentification: cardFormData.payer && cardFormData.payer.identification,
      meta: startCheckoutTracking()
    };

    let data = {};
    let res;
    try {
      res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      data = await res.json().catch(() => ({}));
    } catch (netErr) {
      showCheckoutMessage('error', 'Falha de conexão ao processar o pagamento. Verifique sua internet e tente novamente.');
      throw netErr;
    }

    if (!res.ok || !data.success) {
      const msg = data.error || 'Não foi possível processar o pagamento.';
      showCheckoutMessage('error', msg);
      throw new Error(msg);
    }

    if (data.status === 'approved') {
      trackPurchase(data.orderId);
      showPurchaseSuccess();
      return data;
    }
    if (data.status === 'pending_card') {
      showCheckoutMessage('info', data.message || 'Pagamento em análise. Você receberá o e-book assim que for aprovado.');
      pollPaymentStatus(data.orderId);
      return data;
    }

    // Recusado: rejeita a Promise para o Brick liberar o formulário e permitir nova tentativa.
    showCheckoutMessage('error', data.message || 'Pagamento recusado. Tente outro cartão ou use Pix.');
    throw new Error('card-rejected');
  }

  // Consulta o status do pedido até aprovação, recusa ou expiração (Pix e cartão em análise).
  let pollTimer = null;
  function pollPaymentStatus(orderId, maxMinutes = 20) {
    if (!orderId) return;
    if (pollTimer) clearInterval(pollTimer);
    const deadline = Date.now() + maxMinutes * 60 * 1000;

    pollTimer = setInterval(async () => {
      if (Date.now() > deadline) {
        clearInterval(pollTimer);
        return;
      }
      try {
        const res = await fetch(`/api/payment/status/${encodeURIComponent(orderId)}`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (data.status === 'approved') {
          clearInterval(pollTimer);
          trackPurchase(orderId);
          showPurchaseSuccess();
        } else if (['rejected', 'cancelled', 'expired'].includes(data.status)) {
          clearInterval(pollTimer);
          showCheckoutMessage('error', data.status === 'expired'
            ? 'O Pix expirou. Recarregue a página para gerar um novo código.'
            : 'O pagamento não foi aprovado. Tente novamente ou use outra forma de pagamento.');
        }
      } catch (_) { /* rede instável: tenta de novo no próximo ciclo */ }
    }, 5000);
  }

  // 4. CPF Input Mask & Validation Helper
  const cpfInput = document.getElementById('buyer-cpf');
  if (cpfInput) {
    cpfInput.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '');
      if (v.length > 11) v = v.slice(0, 11);
      if (v.length > 9) {
        v = `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6, 9)}-${v.slice(9)}`;
      } else if (v.length > 6) {
        v = `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6)}`;
      } else if (v.length > 3) {
        v = `${v.slice(0, 3)}.${v.slice(3)}`;
      }
      e.target.value = v;
    });
  }

  function isValidCPF(cpf) {
    const clean = String(cpf).replace(/\D/g, '');
    if (clean.length !== 11 || /^(\d)\1{10}$/.test(clean)) return false;
    let sum = 0, rest;
    for (let i = 1; i <= 9; i++) sum += parseInt(clean.substring(i - 1, i), 10) * (11 - i);
    rest = (sum * 10) % 11;
    if (rest === 10 || rest === 11) rest = 0;
    if (rest !== parseInt(clean.substring(9, 10), 10)) return false;
    sum = 0;
    for (let i = 1; i <= 10; i++) sum += parseInt(clean.substring(i - 1, i), 10) * (12 - i);
    rest = (sum * 10) % 11;
    if (rest === 10 || rest === 11) rest = 0;
    if (rest !== parseInt(clean.substring(10, 11), 10)) return false;
    return true;
  }

  // 5. Phone Input Mask
  const phoneInput = document.getElementById('buyer-phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '');
      if (v.length > 11) v = v.slice(0, 11);
      if (v.length > 6) {
        v = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
      } else if (v.length > 2) {
        v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
      }
      e.target.value = v;
    });
  }

  // 5b. Pré-preenche nome, e-mail e WhatsApp informados no fim do quiz (a pessoa não digita duas vezes).
  try {
    const saved = JSON.parse(sessionStorage.getItem('tc_checkout_prefill') || 'null');
    if (saved && typeof saved === 'object') {
      const fill = (id, value) => {
        const el = document.getElementById(id);
        if (el && value && !el.value) el.value = String(value).slice(0, 160);
      };
      fill('buyer-name', saved.name);
      fill('buyer-email', saved.email);
      fill('buyer-phone', saved.phone);
    }
  } catch (_) { /* sem dados salvos: formulário em branco */ }

  // 6. Handle Sales Form Submission
  const salesForm = document.getElementById('sales-checkout-form');
  const pixContainer = document.getElementById('pix-display-area');

  if (salesForm) {
    salesForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Card payments are handled entirely by the Mercado Pago Brick's own submit button.
      if (selectedMethod !== 'pix') return;

      const nameInput = document.getElementById('buyer-name');
      const emailInput = document.getElementById('buyer-email');
      const cpfVal = cpfInput ? cpfInput.value.replace(/\D/g, '') : '';
      const phoneVal = phoneInput ? phoneInput.value.trim() : '';

      if (!nameInput || !nameInput.value.trim()) {
        alert('Por favor, informe seu nome completo.');
        if (nameInput) nameInput.focus();
        return;
      }

      if (!cpfVal || cpfVal.length !== 11) {
        alert('Por favor, informe um CPF válido para emissão da nota fiscal.');
        if (cpfInput) cpfInput.focus();
        return;
      }

      if (!isValidCPF(cpfVal)) {
        alert('O número de CPF informado é inválido. Por favor, confira os números digitados.');
        if (cpfInput) cpfInput.focus();
        return;
      }

      if (!emailInput || !emailInput.value.trim() || !emailInput.value.includes('@')) {
        alert('Por favor, informe um e-mail válido para recebimento do material.');
        if (emailInput) emailInput.focus();
        return;
      }

      if (!isValidPhoneNumber(phoneVal)) {
        alert('Por favor, informe um WhatsApp válido com DDD.');
        if (phoneInput) phoneInput.focus();
        return;
      }

      if (!hasAcceptedTerms()) return;

      const originalBtnText = btnSubmit.innerHTML;
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = 'Processando com segurança...';

      const payload = {
        sessionToken: tokenParam || '',
        name: nameInput.value.trim(),
        cpf: cpfVal,
        email: emailInput.value.trim(),
        phone: phoneVal,
        level: document.body.getAttribute('data-level'),
        acceptedTerms: true,
        expectedPrice: checkoutConfig.price,
        paymentMethod: 'pix',
        meta: startCheckoutTracking()
      };

      try {
        const res = await fetch('/api/payment/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Não foi possível gerar a ordem de pagamento.');
        }

        hideCheckoutMessage();

        if (!data.pixCode) {
          // O sandbox do Mercado Pago não gera QR Code (o usuário de teste não tem chave Pix).
          // O pedido fica criado e o polling acompanha o status caso ele mude.
          btnSubmit.style.display = 'none';
          showCheckoutMessage('info', data.testMode
            ? '<strong>Modo de teste:</strong> pedido Pix criado no Mercado Pago, mas o sandbox não gera QR Code. O QR Code e o copia e cola aparecem normalmente em produção.'
            : 'Pedido criado, mas o Mercado Pago não retornou o código Pix. Recarregue a página e tente novamente ou pague com cartão.');
          pollPaymentStatus(data.orderId);
          return;
        }

        if (pixContainer) {
          document.getElementById('pix-code-field').value = data.pixCode;

          // QR Code nativo do Mercado Pago (base64); fallback gerado a partir do copia e cola
          const qrWrap = document.getElementById('pix-qr-img');
          if (qrWrap) {
            // Só o QR Code do próprio Mercado Pago: gerar em serviço de terceiros exporia o Pix e permitiria trocar o recebedor.
            const hasQrCode = /^[A-Za-z0-9+/=]+$/.test(String(data.qrCodeBase64 || ''));
            qrWrap.hidden = !hasQrCode;
            if (hasQrCode) qrWrap.src = `data:image/png;base64,${data.qrCodeBase64}`;
          }

          pixContainer.classList.add('show');
          pixContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });

          btnSubmit.style.display = 'none';

          // Start 15 minute timer
          startPixCountdown((data.expiresInMinutes || 15) * 60);
          pollPaymentStatus(data.orderId);
        }
      } catch (err) {
        console.error('Checkout error:', err);
        alert(err.message || 'Erro de conexão ao processar pedido. Tente novamente.');
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = originalBtnText;
      }
    });
  }

  // 6. Pix Copy Button
  const btnCopyPix = document.getElementById('btn-copy-pix');
  if (btnCopyPix) {
    btnCopyPix.addEventListener('click', () => {
      const pixField = document.getElementById('pix-code-field');
      if (pixField) {
        pixField.select();
        navigator.clipboard.writeText(pixField.value).then(() => {
          const original = btnCopyPix.textContent;
          btnCopyPix.textContent = 'Copiado!';
          btnCopyPix.style.background = '#34D399';
          btnCopyPix.style.color = '#000';
          setTimeout(() => {
            btnCopyPix.textContent = original;
            btnCopyPix.style.background = '';
            btnCopyPix.style.color = '';
          }, 3000);
        });
      }
    });
  }

  // 7. Pix Countdown Timer
  function startPixCountdown(durationSeconds) {
    let timer = durationSeconds;
    const timerEl = document.getElementById('pix-countdown');
    if (!timerEl) return;

    const interval = setInterval(() => {
      const minutes = Math.floor(timer / 60);
      const seconds = timer % 60;
      timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

      if (--timer < 0) {
        clearInterval(interval);
        timerEl.textContent = 'Expirado';
      }
    }, 1000);
  }

  // 8. FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        faqItems.forEach(i => i.classList.remove('open'));
        if (!isOpen) {
          item.classList.add('open');
        }
      });
    }
  });
});
