(() => {
  const portals = {
    idea: {
      label: 'I HAVE AN IDEA',
      title: 'Something wants to become real.',
      intro: 'You do not need to have it figured out before you begin. An idea can arrive as a spark, a question, a picture, a feeling, a problem worth solving—or something you cannot quite name yet.',
      color: '#fff1a9', accent: '#d89b00', symbol: '✦',
      guides: [
        ['Possibility Guide','What are you hoping could become real?'],
        ['Relationship Guide','Who and what might this creation touch if it grows?'],
        ['Consequence Guide','What might become better—and what could be unintentionally harmed?'],
        ['Experiment Guide','What is the smallest truthful version you could try and learn from?']
      ],
      whisper: 'You do not have to protect the first version. Let reality help you make the map better.'
    },
    building: {
      label: 'I’M ALREADY BUILDING',
      title: 'Bring what already exists.',
      intro: 'Creation does not stop when something becomes real. Building creates feedback. Reality begins answering back. This threshold is a place to notice what the work itself may now be teaching you.',
      color: '#dff6f3', accent: '#079b98', symbol: '↻',
      guides: [
        ['Clarity Guide','What is working well enough that it deserves to be protected?'],
        ['Feedback Guide','What is reality showing you that the original plan did not?'],
        ['Relationship Guide','Who or what is affected by the way this is being built?'],
        ['Adjustment Guide','What is one change you could make without tearing everything apart?']
      ],
      whisper: 'Adjustment is not failure. Living things learn while they grow.'
    },
    stuck: {
      label: 'SOMETHING ISN’T WORKING',
      title: 'You are allowed to stop pushing.',
      intro: 'A stuck place can be exhausting. Before trying harder, Creation OG invites a wider look at the conditions around the problem. Friction may be information—not a verdict about you.',
      color: '#e8f2c9', accent: '#648a32', symbol: '↶',
      guides: [
        ['Relief Guide','What pressure could be set down long enough to see more clearly?'],
        ['Conditions Guide','What changed around the problem—people, timing, resources, expectations or environment?'],
        ['Assumption Guide','What are you treating as fixed that might not actually be fixed?'],
        ['Repair Guide','What would make the next step gentler, safer or more workable?']
      ],
      whisper: 'A wrong turn can become useful information. You are free to return, revise or choose another door.'
    },
    decision: {
      label: 'I’M MAKING A BIG DECISION',
      title: 'Something important is on the line.',
      intro: 'You do not need Creation OG to decide for you. This threshold exists to widen the view before you choose—especially when more than one value, person, consequence or uncertainty matters.',
      color: '#e7edff', accent: '#5572c4', symbol: '◎',
      guides: [
        ['Clarity Guide','What decision is actually yours to make?'],
        ['Evidence Guide','What do you know, what are you assuming, and what remains uncertain?'],
        ['Relationship Guide','Who and what may live with the consequences of this choice?'],
        ['Return Guide','Which options preserve room to learn, repair or change direction later?']
      ],
      whisper: 'The OG Guides shine the light. You decide.'
    },
    curious: {
      label: 'I’M JUST CURIOUS',
      title: 'Wonderful. Nothing has to come of this.',
      intro: 'Curiosity does not need to justify itself. You can wander, notice, follow a strange thread, change your mind or leave with more questions than you brought.',
      color: '#eee1ff', accent: '#7650a5', symbol: '?',
      guides: [
        ['Wonder Guide','What is catching your attention without needing a reason?'],
        ['Observation Guide','What can you notice before deciding what it means?'],
        ['Relationship Guide','What unexpected connections appear when you look around the edges?'],
        ['Exploration Guide','What thread would be fun to follow one step farther?']
      ],
      whisper: 'Wonder is allowed to be enough.'
    }
  };

  const cards = [...document.querySelectorAll('[data-door-mode]')];
  if (!cards.length) return;

  // The two first portals previously shared "idea" mode. Give Building its own threshold.
  if (cards[1] && cards[1].dataset.doorMode === 'idea') cards[1].dataset.doorMode = 'building';

  const overlay = document.createElement('div');
  overlay.className = 'portal-threshold-backdrop';
  overlay.hidden = true;
  overlay.innerHTML = `<section class="portal-threshold" role="dialog" aria-modal="true" aria-labelledby="portalThresholdTitle">
    <button class="portal-threshold-close" type="button" aria-label="Close portal threshold">×</button>
    <div class="portal-threshold-inner"></div>
  </section>`;
  document.body.appendChild(overlay);

  const inner = overlay.querySelector('.portal-threshold-inner');
  const close = overlay.querySelector('.portal-threshold-close');
  let lastTrigger = null;

  const render = mode => {
    const p = portals[mode] || portals.curious;
    inner.innerHTML = `<div class="threshold-top" style="--portal-color:${p.color};--portal-accent:${p.accent}">
      <div class="threshold-symbol">${p.symbol}</div>
      <div><p class="threshold-step">CREATION OG — BABY STEP ONE · PORTAL THRESHOLD</p><p class="threshold-label">${p.label}</p><h2 id="portalThresholdTitle">${p.title}</h2></div>
    </div>
    <p class="threshold-intro">${p.intro}</p>
    <div class="threshold-truth"><b>You found the door.</b><span>The fuller Creation OG experience is still being created behind this threshold. For Baby Step One, the OG Guides can give you a useful first look without pretending the whole system is ready.</span></div>
    <p class="threshold-question">A few OG Guides would begin here:</p>
    <div class="threshold-guides">${p.guides.map((g,i)=>`<article style="--portal-color:${p.color};--portal-accent:${p.accent}"><span>${i+1}</span><div><b>${g[0]}</b><p>${g[1]}</p></div></article>`).join('')}</div>
    <div class="threshold-whisper" style="--portal-color:${p.color};--portal-accent:${p.accent}"><span>just a whisper away</span><b>${p.whisper}</b></div>
    <div class="threshold-actions"><button type="button" class="threshold-guides-button">ASK THE OG GUIDES ✦</button><a href="experiment-001a/">TRY PERCEPTION ARCHITECTURE →</a><a href="#clubhouse" class="threshold-clubhouse">VISIT THE CLUBHOUSE</a></div>
    <button type="button" class="threshold-return">← RETURN THROUGH THE OPEN DOOR</button>`;

    inner.querySelector('.threshold-return').onclick = hide;
    inner.querySelector('.threshold-clubhouse').onclick = hide;
    inner.querySelector('.threshold-guides-button').onclick = () => {
      hide();
      setTimeout(()=>document.querySelector('.guides-button')?.click(),80);
    };
  };

  function show(mode, trigger){
    lastTrigger = trigger || null;
    render(mode);
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    close.focus();
  }
  function hide(){
    overlay.hidden = true;
    document.body.style.overflow = '';
    if (lastTrigger) lastTrigger.focus();
  }

  cards.forEach(card => card.addEventListener('click', e => {
    e.preventDefault();
    e.stopImmediatePropagation();
    show(card.dataset.doorMode, card);
  }, true));
  close.addEventListener('click', hide);
  overlay.addEventListener('click', e => { if (e.target === overlay) hide(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !overlay.hidden) hide(); });

  const style = document.createElement('style');
  style.textContent = `
    .portal-threshold-backdrop[hidden]{display:none}.portal-threshold-backdrop{position:fixed;inset:0;z-index:5000;background:rgba(8,35,56,.74);backdrop-filter:blur(8px);overflow:auto;padding:28px 18px;display:flex;align-items:flex-start;justify-content:center}
    .portal-threshold{position:relative;width:min(980px,100%);margin:auto;background:#fffdf6;border:4px solid #123d64;border-radius:34px;box-shadow:15px 17px 0 rgba(0,0,0,.18);padding:clamp(28px,5vw,54px);color:#123d64}
    .portal-threshold-close{position:absolute;right:20px;top:18px;width:48px;height:48px;border:0;border-radius:50%;background:#123d64;color:#fff;font-size:2rem;line-height:1;cursor:pointer;z-index:2}
    .threshold-top{display:grid;grid-template-columns:90px 1fr;gap:22px;align-items:start}.threshold-symbol{width:84px;height:84px;display:grid;place-items:center;background:var(--portal-color);border:4px solid var(--portal-accent);border-radius:26px;font-size:2.5rem;font-weight:1000;box-shadow:7px 8px 0 rgba(18,61,100,.09);transform:rotate(-4deg)}
    .threshold-step{font-size:.78rem;font-weight:1000;letter-spacing:.09em;color:#657988;margin:3px 0 7px}.threshold-label{display:inline-block;margin:0 0 8px;background:var(--portal-color);border:2px solid var(--portal-accent);border-radius:999px;padding:6px 11px;font-size:.83rem;font-weight:1000;letter-spacing:.04em}.portal-threshold h2{font-size:clamp(2.5rem,5vw,4.8rem);line-height:.95;letter-spacing:-.045em;margin:.08em 58px .2em 0}.threshold-intro{font-size:1.16rem;line-height:1.58;max-width:74ch;margin:24px 0}
    .threshold-truth{display:grid;grid-template-columns:auto 1fr;gap:18px;align-items:center;background:#123d64;color:#fff;border-radius:22px;padding:20px 23px;box-shadow:7px 8px 0 #ffc83d;margin:28px 0}.threshold-truth b{color:#ffd34d;font-size:1.18rem;white-space:nowrap}.threshold-truth span{line-height:1.45}
    .threshold-question{font-size:1.18rem;font-weight:1000;margin:34px 0 16px}.threshold-guides{display:grid;grid-template-columns:1fr 1fr;gap:16px}.threshold-guides article{display:grid;grid-template-columns:44px 1fr;gap:13px;background:var(--portal-color);border:3px solid color-mix(in srgb,var(--portal-accent) 45%,white);border-radius:22px;padding:18px;box-shadow:5px 6px 0 rgba(18,61,100,.07)}.threshold-guides article>span{width:40px;height:40px;display:grid;place-items:center;border-radius:13px;background:var(--portal-accent);color:#fff;font-weight:1000}.threshold-guides b{font-size:1.08rem}.threshold-guides p{margin:4px 0 0;line-height:1.4;color:#274a64}
    .threshold-whisper{margin:28px 0;background:#fff;border:3px dashed var(--portal-accent);border-radius:22px;padding:18px 22px}.threshold-whisper span{display:block;text-transform:uppercase;letter-spacing:.1em;font-size:.73rem;font-weight:1000;color:var(--portal-accent);margin-bottom:4px}.threshold-whisper b{font-size:1.12rem;line-height:1.4}
    .threshold-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:28px}.threshold-actions button,.threshold-actions a{border:0;border-radius:999px;padding:14px 18px;font-weight:1000;text-decoration:none;cursor:pointer;font-size:.92rem}.threshold-guides-button{background:#079b98;color:#fff;box-shadow:4px 5px 0 #ffc83d}.threshold-actions>a{background:#f06423;color:#fff}.threshold-actions .threshold-clubhouse{background:#fff;border:2px solid #123d64;color:#123d64}.threshold-return{display:block;margin:28px auto 0;border:0;background:transparent;color:#526b7d;font-weight:1000;cursor:pointer;border-bottom:2px solid #bfd1d5;padding:6px}
    @media(max-width:720px){.portal-threshold-backdrop{padding:12px 8px}.portal-threshold{border-radius:24px;padding:28px 18px}.threshold-top{grid-template-columns:64px 1fr;gap:14px}.threshold-symbol{width:60px;height:60px;border-radius:18px;font-size:1.8rem}.portal-threshold h2{font-size:2.55rem;margin-right:35px}.threshold-truth{grid-template-columns:1fr}.threshold-truth b{white-space:normal}.threshold-guides{grid-template-columns:1fr}.threshold-actions>*{width:100%;text-align:center}.portal-threshold-close{right:12px;top:12px;width:42px;height:42px}}
  `;
  document.head.appendChild(style);
})();