(() => {
  /* WP-007B — The Creator's Place: replace the temporary hero art at runtime
     while preserving the approved text-free production asset. */
  const hero=document.querySelector('.welcome-art');
  if(hero){
    hero.innerHTML='<div class="creator-place"><img src="hero-creators-place.png" alt="A handcrafted Creation OG welcome place with a smiling sun, creative tools, living plants and an intentionally blank card waiting for what the visitor brings"></div>';
    const style=document.createElement('style');
    style.textContent=`
      .welcome-threshold{grid-template-columns:minmax(0,.98fr) minmax(520px,1.12fr);gap:28px;padding-right:2.5vw}
      .welcome-art{min-height:590px;display:flex;align-items:center;justify-content:center;overflow:visible}
      .creator-place{width:min(780px,100%);display:flex;align-items:center;justify-content:center;position:relative}
      .creator-place:before{content:"";position:absolute;width:78%;height:70%;border-radius:50%;background:radial-gradient(circle,rgba(255,248,205,.72),rgba(255,255,255,.18) 58%,transparent 72%);filter:blur(10px)}
      .creator-place img{position:relative;z-index:1;width:100%;height:auto;object-fit:contain;filter:drop-shadow(0 20px 20px rgba(18,61,100,.16))}
      .guides-section{grid-template-columns:minmax(480px,.95fr) minmax(0,1.05fr);gap:54px;background:linear-gradient(135deg,#fff 0%,#fffdf6 52%,#eef9f5 100%)}
      .guides-art{min-height:560px;display:flex;align-items:center;justify-content:center}
      .guides-art img{width:min(720px,100%);max-height:none;margin:0;object-fit:contain;filter:drop-shadow(0 20px 18px rgba(18,61,100,.14))}
      .og-guides-mark{display:none!important}
      @media(max-width:1250px){.welcome-threshold{grid-template-columns:1fr;padding-right:5vw}.welcome-art{min-height:auto;margin-top:24px}.creator-place{width:min(900px,96%);margin:auto}.guides-section{grid-template-columns:1fr}.guides-art{min-height:auto}.guides-art img{width:min(820px,96%);margin:auto}}
      @media(max-width:620px){.welcome-art{min-height:auto;margin-top:32px}.creator-place{width:100%}.creator-place img{filter:drop-shadow(0 12px 12px rgba(18,61,100,.13))}.guides-art img{width:100%;filter:drop-shadow(0 12px 12px rgba(18,61,100,.11))}}
    `;
    document.head.appendChild(style);
  }

  /* WP-008 — The OG Guides / Shine the Light. */
  const guidesArt=document.querySelector('.guides-art');
  if(guidesArt){
    guidesArt.innerHTML='<img src="og-guides-shine-the-light.png" alt="The Creation OG sunshine wearing dark lenses and exploring one living seedling through many perspectives, including roots, pollination, patterns and the wider living world">';
  }

  const panel=document.querySelector('[data-guides-panel]');
  const backdrop=document.querySelector('[data-guides-backdrop]');
  const openers=[...document.querySelectorAll('[data-guides]')];
  const doors=[...document.querySelectorAll('[data-door-mode]')];
  const close=document.querySelector('[data-guides-close]');
  const response=document.querySelector('[data-guide-response]');
  const modes=[...document.querySelectorAll('[data-guide-mode]')];
  const messages={
    idea:`<p><strong>Creation Guide:</strong> What are you hoping could become real?</p><p><strong>Relationship Guide:</strong> Who and what might this creation touch?</p><p><strong>Experiment Guide:</strong> What is the smallest truthful version you could try and learn from?</p>`,
    decision:`<p><strong>Clarity Guide:</strong> What decision is actually yours to make?</p><p><strong>Evidence Guide:</strong> What do you know, what are you assuming, and what remains uncertain?</p><p><strong>Return Guide:</strong> Which options preserve room to learn, change direction or repair?</p>`,
    question:`<p><strong>Clarity Guide:</strong> What would become possible if this question became clearer?</p><p><strong>Evidence Guide:</strong> What is observable, what is interpretation, and where might credible perspectives differ?</p><p><strong>Freedom Guide:</strong> You do not need certainty before you are allowed to keep looking.</p>`,
    stuck:`<p><strong>Clarity Guide:</strong> What exactly is not working?</p><p><strong>Relationship Guide:</strong> Has something changed in the people, conditions or relationships around it?</p><p><strong>Return Guide:</strong> A wrong turn can be information. What might reality be trying to show you?</p>`,
    curious:`<p><strong>Wonder Guide:</strong> Perfect. You do not need a project to be here.</p><p><strong>Living World Guide:</strong> What is catching your attention right now?</p><p><strong>Experiment Guide:</strong> Follow one thread and see what appears. You can always come back.</p>`
  };
  const choose=(mode)=>{
    modes.forEach(b=>b.classList.toggle('active',b.dataset.guideMode===mode));
    if(response&&messages[mode])response.innerHTML=messages[mode];
  };
  const setOpen=(open,mode)=>{
    if(!panel||!backdrop)return;
    panel.hidden=!open;backdrop.hidden=!open;
    document.body.style.overflow=open?'hidden':'';
    if(open&&mode)choose(mode);
    if(open&&close)close.focus();
  };
  openers.forEach(btn=>btn.addEventListener('click',()=>setOpen(true)));
  doors.forEach(door=>door.addEventListener('click',()=>setOpen(true,door.dataset.doorMode)));
  if(close)close.addEventListener('click',()=>setOpen(false));
  if(backdrop)backdrop.addEventListener('click',()=>setOpen(false));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')setOpen(false)});
  modes.forEach(btn=>btn.addEventListener('click',()=>choose(btn.dataset.guideMode)));
})();