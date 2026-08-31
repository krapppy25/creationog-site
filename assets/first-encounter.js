(() => {
  const panel=document.querySelector('[data-guides-panel]');
  const backdrop=document.querySelector('[data-guides-backdrop]');
  const openers=[...document.querySelectorAll('[data-guides]')];
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
  const setOpen=(open)=>{
    if(!panel||!backdrop)return;
    panel.hidden=!open;backdrop.hidden=!open;
    document.body.style.overflow=open?'hidden':'';
    if(open&&close)close.focus();
  };
  openers.forEach(btn=>btn.addEventListener('click',()=>setOpen(true)));
  if(close)close.addEventListener('click',()=>setOpen(false));
  if(backdrop)backdrop.addEventListener('click',()=>setOpen(false));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')setOpen(false)});
  modes.forEach(btn=>btn.addEventListener('click',()=>{
    modes.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const html=messages[btn.dataset.guideMode];
    if(response&&html)response.innerHTML=html;
  }));
})();