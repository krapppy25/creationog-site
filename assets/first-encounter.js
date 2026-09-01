(() => {
  const style=document.createElement('style');
  style.textContent=`
    .welcome-threshold{grid-template-columns:minmax(0,.98fr) minmax(520px,1.12fr);gap:28px;padding-right:2.5vw}
    .welcome-art{min-height:590px;display:flex;align-items:center;justify-content:center;overflow:visible}
    .creator-place{width:min(780px,100%);display:flex;align-items:center;justify-content:center;position:relative}
    .creator-place:before{content:"";position:absolute;width:78%;height:70%;border-radius:50%;background:radial-gradient(circle,rgba(255,248,205,.72),rgba(255,255,255,.18) 58%,transparent 72%);filter:blur(10px)}
    .creator-place img{position:relative;z-index:1;width:100%;height:auto;object-fit:contain;filter:drop-shadow(0 20px 20px rgba(18,61,100,.16))}
    .welcome-pledge span{border:2px solid rgba(7,155,152,.16);box-shadow:0 10px 24px rgba(18,61,100,.10);min-height:128px;padding:16px 14px}
    .welcome-pledge b{font-size:1.2rem}.welcome-pledge small{font-size:.94rem;line-height:1.35}
    .section-intro .portal-guidance{margin-top:18px;font-size:1.12rem;line-height:1.55}.portal-guidance strong{color:var(--teal)}
    .guides-section{grid-template-columns:minmax(480px,.95fr) minmax(0,1.05fr);gap:54px;background:linear-gradient(135deg,#fff 0%,#fffdf6 52%,#eef9f5 100%)}
    .guides-art{min-height:560px;display:flex;align-items:center;justify-content:center}.guides-art img{width:min(720px,100%);max-height:none;margin:0;object-fit:contain;filter:drop-shadow(0 20px 18px rgba(18,61,100,.14))}
    .guides-intro{font-size:1.12rem;max-width:65ch}.guides-intro p{margin:0 0 14px}.guides-intro p:last-child{margin-bottom:0}
    .guide-list span{display:flex;flex-direction:column;gap:3px}.guide-list span>span{display:block;background:none;padding:0;border-radius:0}.guide-list b{display:block;font-size:1.08rem}
    .guides-preview-note{font-size:.9rem!important;color:#526b7d;margin:.8rem 0 0;max-width:48ch}
    .promise-grid{grid-template-columns:repeat(3,1fr);max-width:1180px}.promise-grid article{min-height:145px}.promise-grid b{font-size:1.15rem}.promise-grid p{font-size:1rem}
    .promise-bottom span{font-size:1.05rem;line-height:1.5}.promise-bottom b{font-size:1.22rem;margin-bottom:5px}
    @media(max-width:1250px){.welcome-threshold{grid-template-columns:1fr;padding-right:5vw}.welcome-art{min-height:auto;margin-top:24px}.creator-place{width:min(900px,96%);margin:auto}.guides-section{grid-template-columns:1fr}.guides-art{min-height:auto}.guides-art img{width:min(820px,96%);margin:auto}}
    @media(max-width:900px){.promise-grid{grid-template-columns:1fr 1fr}}
    @media(max-width:620px){.welcome-art{min-height:auto;margin-top:32px}.creator-place{width:100%}.creator-place img{filter:drop-shadow(0 12px 12px rgba(18,61,100,.13))}.guides-art img{width:100%;filter:drop-shadow(0 12px 12px rgba(18,61,100,.11))}.promise-grid{grid-template-columns:1fr}.promise-grid article{min-height:0}.section-intro br{display:none}}
  `;
  document.head.appendChild(style);

  const panel=document.querySelector('[data-guides-panel]');
  const backdrop=document.querySelector('[data-guides-backdrop]');
  const openers=[...document.querySelectorAll('[data-guides]')];
  const doors=[...document.querySelectorAll('[data-door-mode]')];
  const close=document.querySelector('[data-guides-close]');
  const response=document.querySelector('[data-guide-response]');
  const modes=[...document.querySelectorAll('[data-guide-mode]')];
  const messages={idea:`<p><strong>Creation Guide:</strong> What are you hoping could become real?</p><p><strong>Relationship Guide:</strong> Who and what might this creation touch?</p><p><strong>Experiment Guide:</strong> What is the smallest truthful version you could try and learn from?</p>`,decision:`<p><strong>Clarity Guide:</strong> What decision is actually yours to make?</p><p><strong>Evidence Guide:</strong> What do you know, what are you assuming, and what remains uncertain?</p><p><strong>Return Guide:</strong> Which options preserve room to learn, change direction or repair?</p>`,question:`<p><strong>Clarity Guide:</strong> What would become possible if this question became clearer?</p><p><strong>Evidence Guide:</strong> What is observable, what is interpretation, and where might credible perspectives differ?</p><p><strong>Freedom Guide:</strong> You do not need certainty before you are allowed to keep looking.</p>`,stuck:`<p><strong>Clarity Guide:</strong> What exactly is not working?</p><p><strong>Relationship Guide:</strong> Has something changed in the people, conditions or relationships around it?</p><p><strong>Return Guide:</strong> A wrong turn can be information. What might reality be trying to show you?</p>`,curious:`<p><strong>Wonder Guide:</strong> You do not need a project to be here.</p><p><strong>Living World Guide:</strong> What is catching your attention right now?</p><p><strong>Experiment Guide:</strong> Follow one thread and see what appears. You can always come back.</p>`};
  const choose=(mode)=>{modes.forEach(b=>b.classList.toggle('active',b.dataset.guideMode===mode));if(response&&messages[mode])response.innerHTML=messages[mode]};
  const setOpen=(open,mode)=>{if(!panel||!backdrop)return;panel.hidden=!open;backdrop.hidden=!open;document.body.style.overflow=open?'hidden':'';if(open&&mode)choose(mode);if(open&&close)close.focus()};
  openers.forEach(btn=>btn.addEventListener('click',()=>setOpen(true)));doors.forEach(door=>door.addEventListener('click',()=>setOpen(true,door.dataset.doorMode)));if(close)close.addEventListener('click',()=>setOpen(false));if(backdrop)backdrop.addEventListener('click',()=>setOpen(false));document.addEventListener('keydown',e=>{if(e.key==='Escape')setOpen(false)});modes.forEach(btn=>btn.addEventListener('click',()=>choose(btn.dataset.guideMode)));
})();