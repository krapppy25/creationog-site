(() => {
  const style=document.createElement('style');
  style.textContent=`
    .site-nav{gap:38px;padding-left:3.8vw;padding-right:3.8vw}
    .site-nav nav{gap:clamp(34px,3.2vw,58px)}
    .site-nav nav a{font-size:1.12rem;letter-spacing:.03em}

    .welcome-threshold{grid-template-columns:minmax(0,.98fr) minmax(520px,1.12fr);gap:28px;padding-right:2.5vw}
    .welcome-art{min-height:590px;display:flex;align-items:center;justify-content:center;overflow:visible}
    .creator-place{width:min(780px,100%);display:flex;align-items:center;justify-content:center;position:relative}
    .creator-place:before{content:"";position:absolute;width:78%;height:70%;border-radius:50%;background:radial-gradient(circle,rgba(255,248,205,.72),rgba(255,255,255,.18) 58%,transparent 72%);filter:blur(10px)}
    .creator-place img{position:relative;z-index:1;width:100%;height:auto;object-fit:contain;filter:drop-shadow(0 20px 20px rgba(18,61,100,.16))}

    .welcome-pledge{gap:14px}
    .welcome-pledge span{position:relative;border:3px solid rgba(18,61,100,.08);box-shadow:6px 7px 0 rgba(18,61,100,.08);min-height:140px;padding:38px 15px 16px;border-radius:24px;overflow:visible}
    .welcome-pledge span:before{position:absolute;top:-20px;left:50%;transform:translateX(-50%);width:48px;height:48px;border-radius:50%;display:grid;place-items:center;font-size:1.65rem;font-weight:1000;border:4px solid #fff;box-shadow:0 6px 12px rgba(18,61,100,.10)}
    .welcome-pledge span:nth-child(1){background:#dff6f3}.welcome-pledge span:nth-child(1):before{content:"↗";background:#08a6a2;color:#fff}
    .welcome-pledge span:nth-child(2){background:#fff1a9}.welcome-pledge span:nth-child(2):before{content:"✦";background:#ffc83d;color:#8b5200}
    .welcome-pledge span:nth-child(3){background:#ffdcd0}.welcome-pledge span:nth-child(3):before{content:"♥";background:#ff7f67;color:#fff}
    .welcome-pledge span:nth-child(4){background:#eee1ff}.welcome-pledge span:nth-child(4):before{content:"☁";background:#8f68bc;color:#fff}
    .welcome-pledge span:nth-child(5){background:#e8f2c9}.welcome-pledge span:nth-child(5):before{content:"↶";background:#6c8e37;color:#fff}
    .welcome-pledge b{font-size:1.24rem;line-height:1.15}.welcome-pledge small{font-size:.96rem;line-height:1.35}

    .section-intro .portal-guidance{margin-top:20px;font-size:1.14rem;line-height:1.58}.portal-guidance strong{color:var(--teal)}

    .guides-section{grid-template-columns:minmax(480px,.95fr) minmax(0,1.05fr);gap:54px;background:linear-gradient(135deg,#fff 0%,#fffdf6 52%,#eef9f5 100%)}
    .guides-art{min-height:560px;display:flex;align-items:center;justify-content:center}.guides-art img{width:min(720px,100%);max-height:none;margin:0;object-fit:contain;filter:drop-shadow(0 20px 18px rgba(18,61,100,.14))}
    .guides-intro{font-size:1.15rem;max-width:65ch}.guides-intro p{margin:0 0 15px}.guides-intro p:last-child{margin-bottom:0}
    .guide-list{gap:18px;margin-top:30px}.guide-list>span{position:relative;display:flex;flex-direction:column;gap:6px;padding:26px 22px 22px 72px;border:3px solid rgba(18,61,100,.09);border-radius:22px;box-shadow:6px 7px 0 rgba(18,61,100,.07);min-height:120px}
    .guide-list>span:before{position:absolute;left:17px;top:20px;width:40px;height:40px;border-radius:14px;display:grid;place-items:center;font-size:1.3rem;font-weight:1000;color:#fff;transform:rotate(-5deg)}
    .guide-list>span:nth-child(1){background:#fff2b9}.guide-list>span:nth-child(1):before{content:"?";background:#e6a900}
    .guide-list>span:nth-child(2){background:#dff6f3}.guide-list>span:nth-child(2):before{content:"↔";background:#079b98}
    .guide-list>span:nth-child(3){background:#ffe3d6}.guide-list>span:nth-child(3):before{content:"◎";background:#f06423}
    .guide-list>span:nth-child(4){background:#e7edff}.guide-list>span:nth-child(4):before{content:"↻";background:#5675c9}
    .guide-list span>span{display:block;background:none;padding:0;border-radius:0}.guide-list b{display:block;font-size:1.18rem}.guide-list>span>span{font-size:1.04rem;line-height:1.44}
    .guides-preview-note{font-size:1rem!important;line-height:1.45;color:#405b70;margin:1rem 0 0;max-width:48ch;font-weight:700}

    .promise-section{position:relative;background:linear-gradient(180deg,#fff4c9 0%,#fffaf0 30%,#eef8ff 100%);overflow:hidden}
    .promise-section:before,.promise-section:after{content:"";position:absolute;z-index:0;pointer-events:none}
    .promise-section:before{width:160px;height:160px;left:-42px;top:118px;border:12px solid rgba(255,200,61,.22);border-radius:50%;box-shadow:0 0 0 18px rgba(7,155,152,.08)}
    .promise-section:after{width:210px;height:26px;right:-26px;top:310px;background:linear-gradient(90deg,#ff8b6f,#ffc83d,#09aaa5,#7a59a4);border-radius:99px;transform:rotate(-7deg);opacity:.35}
    .promise-section>*{position:relative;z-index:1}
    .promise-copy{max-width:1060px;margin-bottom:52px}
    .promise-copy .eyebrow{display:inline-block;background:#fff;border:3px solid #ff9e72;border-radius:999px;padding:7px 16px;box-shadow:4px 5px 0 rgba(240,100,35,.14)}
    .promise-copy h2{display:inline-block;position:relative;padding:0 22px 12px;margin-top:18px}
    .promise-copy h2:after{content:"";position:absolute;left:11%;right:8%;bottom:0;height:9px;background:linear-gradient(90deg,#ffc83d 0 28%,#079b98 28% 58%,#f06423 58% 78%,#7650a5 78%);border-radius:99px;transform:rotate(-1deg)}
    .human-service-promise{font-size:clamp(1.5rem,2.1vw,2rem)!important;line-height:1.34!important;font-weight:1000;max-width:850px;margin:30px auto 0!important;padding:25px 34px 27px;background:#fff;border:4px solid #123d64;border-radius:26px;box-shadow:10px 11px 0 #ffc83d;color:#123d64;transform:rotate(-.45deg)}

    .promise-grid{grid-template-columns:repeat(3,1fr);max-width:1240px;gap:28px}
    .promise-grid article{position:relative;min-height:205px;border:4px solid rgba(18,61,100,.10);padding:58px 28px 28px;border-radius:30px;box-shadow:9px 10px 0 rgba(18,61,100,.08);overflow:visible}
    .promise-grid article:before{position:absolute;top:-25px;left:24px;width:68px;height:68px;border-radius:22px;display:grid;place-items:center;font-size:2rem;border:5px solid #fff;box-shadow:0 7px 14px rgba(18,61,100,.13);transform:rotate(-7deg)}
    .promise-grid article:after{content:"";position:absolute;right:20px;top:22px;width:44px;height:8px;border-radius:99px;background:currentColor;opacity:.28;transform:rotate(-8deg)}
    .promise-grid article:nth-child(even):before{transform:rotate(7deg)}
    .promise-grid b{display:block;font-size:1.42rem;line-height:1.08;margin-bottom:13px}.promise-grid p{font-size:1.12rem;line-height:1.48;margin:0}
    .promise-card-one{background:#fff1a9!important;color:#8c4f00}.promise-card-one:before{content:"✦";background:#ffc83d;color:#8c4f00}
    .promise-card-two{background:#d8f5f1!important;color:#087c79}.promise-card-two:before{content:"↗";background:#079b98;color:#fff}
    .promise-card-three{background:#ffdcd0!important;color:#b84b2d}.promise-card-three:before{content:"♥";background:#ff7f67;color:#fff}
    .promise-card-four{background:#dceeff!important;color:#145f91}.promise-card-four:before{content:"♕";background:#4c9ed1;color:#fff}
    .promise-card-five{background:#eee1ff!important;color:#684595}.promise-card-five:before{content:"☁";background:#8d6bb5;color:#fff}
    .promise-card-six{background:#e8f2c9!important;color:#4f7125}.promise-card-six:before{content:"↶";background:#6f9139;color:#fff}
    .promise-grid article b{color:currentColor}.promise-grid article p{color:#274a64}

    .promise-bottom{max-width:1260px;margin-top:66px;gap:42px;flex-wrap:nowrap;background:#fffdf6;border:4px dashed rgba(18,61,100,.18);border-radius:34px;padding:26px 34px;box-shadow:8px 9px 0 rgba(7,155,152,.12)}
    .promise-bottom img{width:270px;flex:0 0 auto;filter:drop-shadow(0 14px 12px rgba(18,61,100,.12))}.promise-bottom>div{min-width:0}.promise-bottom b{font-size:1.5rem;margin-bottom:8px}.relationship-line{display:block;font-size:1.12rem!important;line-height:1.45;white-space:nowrap;font-weight:800}

    footer{font-size:1.03rem}

    @media(max-width:1350px){.site-nav nav{gap:27px}.site-nav nav a{font-size:1.04rem}.relationship-line{font-size:1.02rem!important}}
    @media(max-width:1250px){.welcome-threshold{grid-template-columns:1fr;padding-right:5vw}.welcome-art{min-height:auto;margin-top:24px}.creator-place{width:min(900px,96%);margin:auto}.guides-section{grid-template-columns:1fr}.guides-art{min-height:auto}.guides-art img{width:min(820px,96%);margin:auto}.promise-bottom{max-width:1000px}.relationship-line{white-space:normal}}
    @media(max-width:900px){.promise-grid{grid-template-columns:1fr 1fr}.promise-bottom{flex-direction:column;text-align:center}.promise-bottom img{width:min(330px,72vw)}.relationship-line{white-space:normal}.review-break{display:none}.welcome-pledge span{min-height:150px}}
    @media(max-width:620px){.welcome-art{min-height:auto;margin-top:32px}.creator-place{width:100%}.creator-place img{filter:drop-shadow(0 12px 12px rgba(18,61,100,.13))}.guides-art img{width:100%;filter:drop-shadow(0 12px 12px rgba(18,61,100,.11))}.guide-list{grid-template-columns:1fr}.guide-list>span{padding:24px 18px 20px 68px}.promise-grid{grid-template-columns:1fr}.promise-grid article{min-height:0}.human-service-promise{font-size:1.27rem!important;padding:22px 18px}.promise-bottom{padding:22px 18px}.section-intro br{display:none}}
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