(() => {
  const doors = [...document.querySelectorAll('.door')];
  const fieldNote = document.querySelector('.field-note');
  const messages = [
    ['IDEA MODE', 'Wonderful. Keep it light enough to move and real enough to learn. Start by asking: who decides, and what are you actually trying to make possible?'],
    ['BUILD MODE', 'You already have momentum. Good. We do not need to restart. We look for the next consequential decision, the people and places it touches, and the smallest truthful next move.'],
    ['REALITY REPLIED', 'Something not working is information, not a verdict. Let’s notice what reality is correcting before we decide what should change.'],
    ['DECISION MODE', 'Big decisions deserve enough room to see clearly. We slow down only the consequential part: authority, affected field, permission, evidence, reversibility, and return.'],
    ['CURIOSITY MODE', 'Perfect. You do not need a project to explore. Wander. Open a door. Visit the Number Lab. Notice what makes you curious.']
  ];

  doors.forEach((door, i) => {
    door.setAttribute('aria-expanded', 'false');
    door.addEventListener('click', () => {
      doors.forEach(d => { d.classList.remove('door-active'); d.setAttribute('aria-expanded','false'); });
      door.classList.add('door-active');
      door.setAttribute('aria-expanded','true');
      if (fieldNote) {
        fieldNote.innerHTML = `<b>${messages[i][0]}:</b> ${messages[i][1]}`;
        fieldNote.classList.remove('field-note-pop');
        void fieldNote.offsetWidth;
        fieldNote.classList.add('field-note-pop');
        fieldNote.scrollIntoView({behavior:'smooth', block:'nearest'});
      }
    });
  });

  const revealables = document.querySelectorAll('.path article, .paper-note, .trip-copy, .lab-window');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('arrived');
          observer.unobserve(entry.target);
        }
      });
    }, {threshold:.16});
    revealables.forEach((el, i) => {
      el.classList.add('arrival-ready');
      el.style.setProperty('--arrival-delay', `${Math.min(i % 5,4) * 55}ms`);
      observer.observe(el);
    });
  }

  const sun = document.querySelector('.sun-wink');
  if (sun) {
    sun.addEventListener('mouseenter', () => sun.classList.add('sun-hello'));
    sun.addEventListener('animationend', () => sun.classList.remove('sun-hello'));
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('reduced-motion');
  }
})();