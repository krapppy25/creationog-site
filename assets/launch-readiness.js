(() => {
  // Baby Step One launch-readiness layer: accessibility, focus visibility,
  // reduced-motion respect, touch sizing, and graceful small-screen navigation.
  const nav = document.querySelector('.site-nav');
  const navLinks = nav?.querySelector('nav');
  if (nav && navLinks) {
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'mobile-nav-toggle';
    toggle.setAttribute('aria-expanded','false');
    toggle.setAttribute('aria-controls','creationog-primary-nav');
    toggle.textContent = 'MENU';
    navLinks.id = 'creationog-primary-nav';
    nav.insertBefore(toggle, navLinks);
    toggle.addEventListener('click',()=>{
      const open = nav.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'CLOSE' : 'MENU';
    });
    navLinks.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
      nav.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded','false');
      toggle.textContent='MENU';
    }));
  }

  // Make section anchors land below the sticky navigation.
  document.querySelectorAll('section[id]').forEach(s=>s.style.scrollMarginTop='105px');

  // Preserve the intentional two-line portal introduction while guaranteeing
  // a visible word space at narrow widths. The desktop <br> can otherwise sit
  // directly between "conditions" and "for" in some mobile layout engines.
  const portalIntro = document.querySelector('.portals-section .section-intro > p:not(.eyebrow):not(.portal-guidance)');
  if (portalIntro) {
    portalIntro.innerHTML = 'Each portal opens a different set of conditions<span class="portal-word-space"> </span><br>for attention, reflection and creation.';
  }

  const style = document.createElement('style');
  style.textContent = `
    :focus-visible{outline:4px solid #ffc83d!important;outline-offset:4px!important}
    button,a,select,input,textarea{touch-action:manipulation}
    .portal-word-space{white-space:pre}
    .mobile-nav-toggle{display:none;border:2px solid #123d64;background:#fffdf6;color:#123d64;border-radius:999px;padding:10px 14px;font-weight:1000;letter-spacing:.05em;cursor:pointer}
    @media(max-width:1050px){
      .site-nav{display:grid!important;grid-template-columns:auto 1fr auto;align-items:center;gap:12px!important;padding:12px 4vw!important}
      .site-nav .brand{grid-column:1}.mobile-nav-toggle{display:block;grid-column:2;justify-self:end}.site-nav>.guides-button{grid-column:3}
      .site-nav nav{display:none!important;grid-column:1/-1;grid-row:2;background:#fffdf6;border:3px solid rgba(18,61,100,.10);border-radius:22px;padding:10px;box-shadow:7px 8px 0 rgba(18,61,100,.08);flex-direction:column!important;align-items:stretch!important;gap:4px!important}
      .site-nav.nav-open nav{display:flex!important}.site-nav nav a{display:block;padding:12px 14px;border-radius:12px;font-size:1rem!important}.site-nav nav a:hover{background:#dff6f3}
    }
    @media(max-width:680px){
      .site-nav{grid-template-columns:1fr auto}.site-nav .brand{grid-column:1}.mobile-nav-toggle{grid-column:2}.site-nav>.guides-button{grid-column:1/-1;width:100%;justify-content:center;min-height:50px}.site-nav>.guides-button span{display:inline!important;margin-left:8px}
      .welcome-actions>a,.welcome-actions>button,.lab-enter,.primary-button,.clubhouse-send{min-height:52px;display:flex!important;align-items:center;justify-content:center;text-align:center}
      .portal-card{min-height:44px}.portal-law{gap:12px!important}.portal-law span{font-size:1rem!important}
      .welcome-pledge{grid-template-columns:1fr!important}.welcome-pledge span{min-height:0!important;padding-top:42px!important}
      .promise-bottom{overflow:hidden}.relationship-line{font-size:.96rem!important;line-height:1.65!important}
      footer{gap:10px!important;padding-left:18px!important;padding-right:18px!important;text-align:center}
    }
    @media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}
  `;
  document.head.appendChild(style);
})();