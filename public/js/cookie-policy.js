document.addEventListener('DOMContentLoaded', () => {
  const manageButton = document.getElementById('btn-manage-cookies');
  if (!manageButton) return;
  manageButton.addEventListener('click', () => {
    try { localStorage.removeItem('cookie_consent'); } catch (_) { /* armazenamento bloqueado */ }
    window.location.href = '/';
  });
});
