(function () {
  var PIXEL_ID = '2116846625932657';
  var loaded = false;

  function readConsent() {
    try {
      var saved = JSON.parse(localStorage.getItem('cookie_consent') || 'null');
      return Boolean(saved && saved.categories && saved.categories.marketing === true);
    } catch (e) {
      return false;
    }
  }

  function readCookie(name) {
    var match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : undefined;
  }

  function newEventId(prefix) {
    var random = window.crypto && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2);
    return prefix + '-' + random;
  }

  function loadPixel() {
    if (loaded || !readConsent()) return;
    loaded = true;
    /* eslint-disable */
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    fbq('init', PIXEL_ID);
    fbq('track', 'PageView');
  }

  function track(name, params, eventId) {
    if (!loaded || typeof fbq !== 'function') return;
    fbq('track', name, params || {}, eventId ? { eventID: eventId } : undefined);
  }

  function serverContext(eventId) {
    return {
      consent: readConsent(),
      eventId: eventId,
      fbp: readCookie('_fbp'),
      fbc: readCookie('_fbc'),
      path: window.location.pathname
    };
  }

  window.MetaTracking = { track: track, newEventId: newEventId, serverContext: serverContext, hasConsent: readConsent };

  window.addEventListener('cookie-consent-saved', loadPixel);
  loadPixel();
})();
