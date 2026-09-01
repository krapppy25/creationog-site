(() => {
  const form = document.getElementById('clubhouseForm');
  if (!form) return;

  const sendButton = form.querySelector('.clubhouse-send');
  const messageEl = document.getElementById('clubhouseMessage');
  const typeEl = document.getElementById('clubhouseType');
  const nameEl = document.getElementById('clubhouseName');
  const recipient = 'nathan@arcadiafrequencies.com';

  const buildNote = () => {
    const message = (messageEl?.value || '').trim();
    const type = typeEl?.value || 'Just let me write';
    const name = (nameEl?.value || '').trim() || 'Anonymous';
    const permission = form.querySelector('input[name="sharePermission"]:checked')?.value || 'No';
    const subjectText = 'Creation OG Clubhouse Note — Baby Step One';
    const bodyText = `CREATION OG — BABY STEP ONE\nCLUBHOUSE NOTE\n\nType: ${type}\nName / nickname: ${name}\nPermission to share anonymously in the Clubhouse: ${permission}\n\nNOTE:\n${message}\n\n— Sent intentionally from the Creation OG Clubhouse`;
    return { message, subjectText, bodyText };
  };

  const validate = () => {
    const { message } = buildNote();
    if (message) return true;
    messageEl?.focus();
    messageEl?.setAttribute('placeholder', 'Please leave a note before opening your email.');
    return false;
  };

  if (sendButton) {
    sendButton.textContent = 'OPEN GMAIL TO SEND THIS NOTE →';
    sendButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (!validate()) return;
      const { subjectText, bodyText } = buildNote();
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipient)}&su=${encodeURIComponent(subjectText)}&body=${encodeURIComponent(bodyText)}`;
      const opened = window.open(gmailUrl, '_blank', 'noopener,noreferrer');
      if (!opened) window.location.href = gmailUrl;
    }, true);
  }

  const alternatives = document.createElement('div');
  alternatives.className = 'clubhouse-email-options';
  alternatives.innerHTML = `
    <span>Prefer another email app?</span>
    <button type="button" class="clubhouse-alt-email">USE MY DEFAULT EMAIL APP</button>
    <button type="button" class="clubhouse-copy-note">COPY MY NOTE</button>
    <small class="clubhouse-copy-status" aria-live="polite"></small>
  `;
  const privacy = form.querySelector('.clubhouse-privacy');
  form.insertBefore(alternatives, privacy || null);

  alternatives.querySelector('.clubhouse-alt-email')?.addEventListener('click', () => {
    if (!validate()) return;
    const { subjectText, bodyText } = buildNote();
    window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(subjectText)}&body=${encodeURIComponent(bodyText)}`;
  });

  alternatives.querySelector('.clubhouse-copy-note')?.addEventListener('click', async () => {
    if (!validate()) return;
    const { subjectText, bodyText } = buildNote();
    const text = `To: ${recipient}\nSubject: ${subjectText}\n\n${bodyText}`;
    const status = alternatives.querySelector('.clubhouse-copy-status');
    try {
      await navigator.clipboard.writeText(text);
      if (status) status.textContent = 'Copied. Paste it wherever you like.';
    } catch {
      if (status) status.textContent = 'Copy was blocked by the browser. You can select and copy your note above.';
    }
  });

  const style = document.createElement('style');
  style.textContent = `
    .clubhouse-email-options{display:flex;align-items:center;gap:10px 12px;flex-wrap:wrap;margin:17px 0 4px;padding-top:16px;border-top:2px dashed #d8e2df}
    .clubhouse-email-options>span{width:100%;font-size:.9rem;font-weight:900;color:#405b70}
    .clubhouse-email-options button{border:2px solid #123d64;background:#fffdf6;color:#123d64;border-radius:999px;padding:9px 13px;font-size:.8rem;font-weight:1000;cursor:pointer}
    .clubhouse-email-options button:hover,.clubhouse-email-options button:focus-visible{background:#eef8f5;border-color:#079b98}
    .clubhouse-copy-status{display:block;width:100%;min-height:1.3em;color:#087c79;font-weight:800}
  `;
  document.head.appendChild(style);
})();