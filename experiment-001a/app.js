(() => {
  const STORAGE_KEY = 'creationog_perception_baby_step_one';
  const state = {
    startedAt: new Date().toISOString(),
    responses: [],
    choices: [],
    reflections: {},
    complete: false
  };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));

  const app = document.getElementById('app');
  const bar = document.getElementById('bar');
  const sessionMeta = document.getElementById('sessionMeta');
  if (sessionMeta) sessionMeta.textContent = '5–7 minute experience';

  const screens = [
    {type:'welcome'},
    {type:'encounter', id:'e1', prompt:'Which is larger?', stem:'3/5   or   2/5', options:['3/5','2/5','Same','Unsure']},
    {type:'encounter', id:'e2', prompt:'Which is larger?', stem:'0.62   or   0.48', options:['0.62','0.48','Same','Unsure']},
    {type:'encounter', id:'e3', prompt:'Which pair represents the same quantity?', options:['2/6 and 1/3','2/6 and 1/4','3/5 and 1/2','4/5 and 3/4','Unsure']},
    {type:'encounter', id:'e4', prompt:'Which pair represents the same quantity?', options:['0.40 and 0.4','0.40 and 0.04','0.6 and 0.06','0.25 and 0.205','Unsure']},
    {type:'choice', id:'c1', left:'1/2', right:'0.5', family:'half'},
    {type:'choiceTask', id:'t1', choiceId:'c1', family:'half', prompt:'Which option represents the same quantity?', options:['2/6','5/10','4/10','7/12','Unsure']},
    {type:'choice', id:'c2', left:'1/4', right:'0.25', family:'quarter'},
    {type:'choiceTask', id:'t2', choiceId:'c2', family:'quarter', prompt:'Which option represents the same quantity?', options:['2/10','4/16','4/12','5/16','Unsure']},
    {type:'choice', id:'c3', left:'1/3', right:'0.333333…', family:'third'},
    {type:'choiceTask', id:'t3', choiceId:'c3', family:'third', prompt:'Which option represents the same quantity?', options:['2/8','5/15','4/10','5/12','Unsure']},
    {type:'notice'},
    {type:'compare'},
    {type:'meaning'},
    {type:'finish'}
  ];

  let index = 0;
  let selectedChoice = null;

  const persist = () => sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  const record = (id, data) => { state.responses.push({id, at:new Date().toISOString(), ...data}); persist(); };
  const getResponse = id => [...state.responses].reverse().find(r => r.id === id);
  const progress = () => { if (bar) bar.style.width = `${Math.max(4, (index/(screens.length-1))*100)}%`; };
  const nextButton = (label='Continue') => `<div class="actions"><button class="btn btn-primary" id="next">${label} &nbsp;→</button></div>`;

  const style = document.createElement('style');
  style.textContent = `
    body.app-shell{background:linear-gradient(145deg,#fff3bd 0%,#fffaf0 36%,#dff6f3 72%,#e8efff 100%);min-height:100vh;color:#123d64}
    .public-banner{background:#123d64;color:#fff;text-align:center;padding:9px 18px;font-weight:900;letter-spacing:.03em}.public-banner b{color:#ffd34d}
    .app-top{gap:20px}.sig-mark small{color:#526b7d}.session-pill{background:#fff2b9!important;border:2px solid #e3b02b;color:#7b5100!important}
    .lab-frame{padding:30px 18px 60px}.panel{max-width:860px!important;background:#fffdf6!important;border:4px solid rgba(18,61,100,.1)!important;border-radius:34px!important;box-shadow:13px 14px 0 rgba(18,61,100,.09)!important;padding:clamp(28px,5vw,54px)!important}
    .panel h2{font-size:clamp(2.15rem,4.4vw,4rem)!important;line-height:1!important;letter-spacing:-.04em;margin:.2em 0 .4em}.panel p{font-size:1.08rem}.kicker{display:inline-block;background:#fff1a9;border:2px solid #e0b12f;border-radius:999px;padding:7px 12px;font-weight:1000;letter-spacing:.06em;color:#8a5700}
    .welcome-card{background:#dff6f3;border:3px solid #079b98;border-radius:24px;padding:21px 24px;margin:24px 0;box-shadow:7px 8px 0 rgba(7,155,152,.13)}.welcome-card b{display:block;font-size:1.15rem;color:#087c79}.welcome-card p{margin:.5em 0 0}
    .privacy-note{background:#eee1ff;border-left:7px solid #7650a5;padding:16px 18px;border-radius:0 18px 18px 0;margin:20px 0}.privacy-note strong{color:#684595}
    .math{font-size:clamp(2.5rem,7vw,5rem)!important;line-height:1;text-align:center;background:#fff1a9;border:3px solid #f0c645;border-radius:24px;padding:24px;margin:24px 0;font-weight:1000;letter-spacing:.03em}
    .options{display:grid;gap:12px;margin:20px 0}.option{display:flex;align-items:center;gap:12px;background:#fff;border:2px solid #d8e4e3;border-radius:17px;padding:15px 17px;font-weight:900;cursor:pointer}.option:has(input:checked){background:#dff6f3;border-color:#079b98;box-shadow:4px 5px 0 rgba(7,155,152,.12)}
    .choice-cards{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin:28px 0}.choice-card{border:4px solid #d7e2df;background:#fff;border-radius:26px;padding:32px 20px;font-size:clamp(2.4rem,7vw,4.7rem);font-weight:1000;color:#123d64;cursor:pointer;box-shadow:7px 8px 0 rgba(18,61,100,.07)}.choice-card.selected{background:#fff1a9;border-color:#f0b900;transform:translateY(-3px)}
    .no-pref{border:2px solid #123d64;background:#fffdf6;border-radius:999px;padding:11px 16px;font-weight:1000;color:#123d64;cursor:pointer}.no-pref.selected{background:#eee1ff;border-color:#7650a5}
    .notice-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:24px 0}.notice-card{background:#fff;border:3px solid rgba(18,61,100,.1);border-radius:22px;padding:20px}.notice-card:nth-child(1){background:#fff1a9}.notice-card:nth-child(2){background:#dff6f3}.notice-card:nth-child(3){background:#ffdcd0}.notice-card:nth-child(4){background:#e7edff}.notice-card label{display:block;font-weight:1000;margin-bottom:8px}
    select,textarea{width:100%;padding:13px 14px;border:2px solid #bfd1d5;border-radius:14px;background:#fffdf6;color:#123d64;font:inherit}textarea{min-height:120px;resize:vertical}
    .actions{margin-top:28px}.btn-primary{background:#079b98!important;box-shadow:6px 7px 0 #ffc83d!important;font-size:1.05rem!important;padding:15px 24px!important}
    .reveal{background:#123d64;color:#fff;border-radius:28px;padding:28px;margin:24px 0;box-shadow:9px 10px 0 #ffc83d}.reveal h3{font-size:1.7rem;margin:0 0 10px;color:#ffd34d}.reveal p{margin:.5em 0}.reveal strong{color:#fff1a9}
    .finish-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:26px}.finish-actions a{display:inline-block;text-decoration:none;border-radius:999px;padding:14px 20px;font-weight:1000}.finish-actions .club{background:#f06423;color:#fff;box-shadow:5px 6px 0 #ffc83d}.finish-actions .home{background:#fff;border:2px solid #123d64;color:#123d64}
    .lab-foot{font-size:.9rem}.lab-foot a{color:inherit;font-weight:900}.quiet{font-size:.9rem!important;color:#526b7d}
    @media(max-width:620px){.panel{padding:26px 19px!important}.choice-cards,.notice-grid{grid-template-columns:1fr}.math{padding:20px 10px}.public-banner{font-size:.88rem}.finish-actions a{width:100%;text-align:center}}
  `;
  document.head.appendChild(style);

  function render(){
    progress();
    const s = screens[index];
    if (!app) return;

    if (s.type === 'welcome') {
      app.innerHTML = `<div class="kicker">PERCEPTION ARCHITECTURE</div><h2>Change the lens.<br>See what appears.</h2><p>This is a short Creation OG experience about something very ordinary: familiar quantities written in different forms.</p><div class="welcome-card"><b>No math expertise is needed.</b><p>There is nothing to study, prove or perform. Move naturally. Choose what feels right to you. Notice what your own perception does.</p></div><div class="privacy-note"><strong>Your responses stay here.</strong> Baby Step One stores this experience only in this browser session. Nothing you enter is submitted to Creation OG.</div><label class="option"><input type="checkbox" id="ready"><span>I understand. I want to explore.</span></label>${nextButton('Begin')}`;
      document.getElementById('next').onclick = () => { if (!document.getElementById('ready').checked) return; record('welcome',{ready:true}); index++; render(); };
      return;
    }

    if (s.type === 'encounter') {
      app.innerHTML = `<div class="kicker">JUST NOTICE · ${String(index).padStart(2,'0')}</div><h2>${s.prompt}</h2>${s.stem?`<div class="math">${s.stem}</div>`:''}<div class="options">${s.options.map((o,i)=>`<label class="option"><input type="radio" name="answer" value="${i}"><span>${o}</span></label>`).join('')}</div><p class="quiet">Answer naturally. Speed is not important.</p>${nextButton()}`;
      document.getElementById('next').onclick = () => { const a=document.querySelector('input[name=answer]:checked'); if(!a)return; record(s.id,{answer:s.options[+a.value]}); index++; render(); };
      return;
    }

    if (s.type === 'choice') {
      selectedChoice = null;
      app.innerHTML = `<div class="kicker">YOUR PREFERENCE</div><h2>Which form would you rather use next?</h2><p>They represent the same quantity. Choose the form that feels more natural to you right now.</p><div class="choice-cards"><button class="choice-card" data-v="${s.left}">${s.left}</button><button class="choice-card" data-v="${s.right}">${s.right}</button></div><button class="no-pref" id="nopref">No preference</button>${nextButton('Use this form')}`;
      document.querySelectorAll('.choice-card').forEach(b=>b.onclick=()=>{selectedChoice=b.dataset.v;document.querySelectorAll('.choice-card').forEach(x=>x.classList.remove('selected'));document.getElementById('nopref').classList.remove('selected');b.classList.add('selected')});
      document.getElementById('nopref').onclick=()=>{selectedChoice='No preference';document.querySelectorAll('.choice-card').forEach(x=>x.classList.remove('selected'));document.getElementById('nopref').classList.add('selected')};
      document.getElementById('next').onclick=()=>{if(!selectedChoice)return;state.choices.push({id:s.id,choice:selectedChoice,left:s.left,right:s.right});record(s.id,{choice:selectedChoice});index++;render()};
      return;
    }

    if (s.type === 'choiceTask') {
      const choice = getResponse(s.choiceId)?.choice || 'No preference';
      const fallback = s.family==='half'?'1/2':s.family==='quarter'?'1/4':'1/3';
      const shown = choice==='No preference'?fallback:choice;
      app.innerHTML = `<div class="kicker">SAME QUANTITY · CHOSEN LENS</div><p>You chose:</p><div class="math">${shown}</div><h2>${s.prompt}</h2><div class="options">${s.options.map((o,i)=>`<label class="option"><input type="radio" name="answer" value="${i}"><span>${o}</span></label>`).join('')}</div>${nextButton()}`;
      document.getElementById('next').onclick=()=>{const a=document.querySelector('input[name=answer]:checked');if(!a)return;record(s.id,{shown,answer:s.options[+a.value]});index++;render()};
      return;
    }

    if (s.type === 'notice') {
      app.innerHTML = `<div class="kicker">PAUSE BEFORE EXPLANATION</div><h2>What became noticeable?</h2><p>Don't worry about what you think this experience is “supposed” to mean. Just record what you noticed.</p><label><strong>What, if anything, felt easier, harder, faster, slower or more natural?</strong><textarea id="n1" placeholder="Anything you noticed..."></textarea></label><label><strong>Did one form ever make you feel more certain—or less certain?</strong><textarea id="n2" placeholder="There is no preferred answer..."></textarea></label>${nextButton('Keep looking')}`;
      document.getElementById('next').onclick=()=>{state.reflections.notice1=document.getElementById('n1').value;state.reflections.notice2=document.getElementById('n2').value;persist();index++;render()};
      return;
    }

    if (s.type === 'compare') {
      app.innerHTML = `<div class="kicker">NOW COMPARE DELIBERATELY</div><h2>How did the forms feel?</h2><div class="notice-grid"><div class="notice-card"><label>Fractions felt...</label><select id="fractionFeel"><option>Choose</option><option>Very easy</option><option>Mostly easy</option><option>Neutral</option><option>Mostly difficult</option><option>Very difficult</option></select></div><div class="notice-card"><label>Decimals felt...</label><select id="decimalFeel"><option>Choose</option><option>Very easy</option><option>Mostly easy</option><option>Neutral</option><option>Mostly difficult</option><option>Very difficult</option></select></div><div class="notice-card"><label>I generally preferred...</label><select id="preferred"><option>Choose</option><option>Fractions</option><option>Decimals</option><option>No preference</option><option>It depended on the question</option></select></div><div class="notice-card"><label>My confidence...</label><select id="confidence"><option>Choose</option><option>Changed with the form</option><option>Did not seem to change</option><option>I'm not sure</option></select></div></div>${nextButton()}`;
      document.getElementById('next').onclick=()=>{state.reflections.compare={fractionFeel:fractionFeel.value,decimalFeel:decimalFeel.value,preferred:preferred.value,confidence:confidence.value};persist();index++;render()};
      return;
    }

    if (s.type === 'meaning') {
      const picks = state.choices.map(c=>c.choice).filter(c=>c!=='No preference');
      const fractionPicks = picks.filter(v=>v.includes('/')).length;
      const decimalPicks = picks.filter(v=>v.includes('.') || v.includes('…')).length;
      let personal = 'You did not show a consistent preference between the forms—and that is still information.';
      if (fractionPicks > decimalPicks) personal = 'In your free choices, you leaned more often toward fraction forms.';
      if (decimalPicks > fractionPicks) personal = 'In your free choices, you leaned more often toward decimal forms.';
      app.innerHTML = `<div class="kicker">WHAT BECAME VISIBLE?</div><h2>The quantity stayed the same.<br>The experience may not have.</h2><div class="reveal"><h3>Your small pattern</h3><p>${personal}</p><p><strong>This is not a score, diagnosis or conclusion about you.</strong> It is simply one trace of what you chose in this moment.</p></div><p>Fractions and decimals can represent the same underlying quantity while presenting it differently to perception. Familiarity, learned habits, visual structure, context and other factors can change what feels immediate or difficult.</p><p><strong>The Creation OG question is not “Which form is best?”</strong></p><p>It is: <strong>What becomes visible when the lens changes?</strong></p>${nextButton('One last thought')}`;
      document.getElementById('next').onclick=()=>{index++;render()};
      return;
    }

    if (s.type === 'finish') {
      state.complete = true; state.completedAt = new Date().toISOString(); persist();
      app.innerHTML = `<div class="kicker">BABY STEP ONE</div><h2>You changed the lens.</h2><p>Maybe something obvious appeared. Maybe something subtle appeared. Maybe nothing changed at all.</p><p><strong>All three are valid.</strong></p><div class="welcome-card"><b>Carry this question with you:</b><p>Where else in life might the way something is represented influence what becomes easy, difficult, visible, invisible, familiar or strange?</p></div><p class="privacy-note"><strong>Your Perception Architecture responses were not submitted.</strong> If you want to tell Creation OG what happened for you, the Clubhouse is open.</p><div class="finish-actions"><a class="club" href="../#clubhouse">LEAVE A NOTE IN THE CLUBHOUSE →</a><a class="home" href="../">RETURN TO CREATION OG</a></div>`;
      if (bar) bar.style.width='100%';
    }
  }

  render();
})();