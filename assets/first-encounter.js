(() => {
  const panel=document.querySelector('[data-guides-panel]');
  const backdrop=document.querySelector('[data-guides-backdrop]');
  const openers=[...document.querySelectorAll('[data-guides]')];
  const close=document.querySelector('[data-guides-close]');
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
})();