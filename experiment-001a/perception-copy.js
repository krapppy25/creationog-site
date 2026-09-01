(() => {
  const app = document.getElementById('app');
  if (!app) return;

  const applyReviewedCopy = () => {
    const kicker = app.querySelector('.kicker');
    if (!kicker || kicker.textContent.trim() !== 'PERCEPTION ARCHITECTURE') return;

    const intro = app.querySelector('h2 + p');
    if (intro) {
      intro.innerHTML = 'This is a short Creation OG experience about something very ordinary:<br>familiar quantities written in different forms and perception affects.';
    }

    const welcomeCard = app.querySelector('.welcome-card');
    if (welcomeCard) {
      welcomeCard.innerHTML = '<b>No math expertise is needed.</b><p>There is nothing to study, prove or perform. Move naturally.</p><p>Choose what feels right to you. Notice what your own perception does.</p>';
    }

    const privacy = app.querySelector('.privacy-note');
    if (privacy) {
      privacy.innerHTML = '<strong>Your responses stay here.</strong><p>Baby Step One stores this experience only in this browser session.</p><p>Nothing you enter is submitted to Creation OG.</p>';
    }
  };

  applyReviewedCopy();
})();