
(() => {
  const root=document.getElementById('before-we-name-it');
  const canvas=root.querySelector('#csp-field'), ctx=canvas.getContext('2d');
  const next=root.querySelector('#meaning-next'), before=root.querySelector('#meaning-before'), after=root.querySelector('#meaning-after'), step=root.querySelector('#meaning-step');
  let viewing=1;
  const label=root.querySelector('#meaning-label'), cycleLabel=root.querySelector('#meaning-cycle');
  const play=root.querySelector('#csp-play'), status=root.querySelector('#csp-status');
  const rate=48000, tau=2*Math.PI, N=320;
  const ma=new Float32Array(N*N),mb=new Float32Array(N*N);
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){
    const i=y*N+x,xx=x/(N-1),yy=y/(N-1);
    ma[i]=Math.sin(2*Math.PI*xx)*Math.sin(3*Math.PI*yy);
    mb[i]=Math.sin(3*Math.PI*xx)*Math.sin(2*Math.PI*yy);
  }
  let seed=7139;const targets=Array.from({length:400},()=>{seed=(1664525*seed+1013904223)>>>0;return (seed/4294967296*2-1)*Math.PI;});
  function phase(t,amount){const p=t*35,i=Math.floor(p),f=p-i,e=f*f*(3-2*f);return amount*(targets[i%400]*(1-e)+targets[(i+1)%400]*e);}
  function envelope(t){return t<1.5?0:t<3.5?(t-1.5)/2:t<5.5?1:t<7.5?1-(t-5.5)/2:0;}
  function color(id){const c=document.createElement('canvas');c.width=c.height=1;const k=c.getContext('2d');k.fillStyle=getComputedStyle(root.querySelector(id)).color;k.fillRect(0,0,1,1);return k.getImageData(0,0,1,1).data;}
  let colors=[color('#csp-base'),color('#csp-color')],last=[.5,.5,.5],audio=null,audioContext=null,source=null,active=false,frame=0,token=0,watchdog=0;
  function draw(stats){last=stats;const img=ctx.createImageData(N,N),bg=colors[0],fg=colors[1];
    for(let i=0;i<ma.length;i++){const energy=Math.max(0,ma[i]*ma[i]*stats[0]+mb[i]*mb[i]*stats[1]+2*ma[i]*mb[i]*stats[2]);const q=Math.exp(-energy/.012);
      for(let j=0;j<3;j++)img.data[i*4+j]=Math.round(bg[j]*(1-q)+fg[j]*q);img.data[i*4+3]=255;}
    ctx.putImageData(img,0,0);
  }
  function mark(amount){}
  function sampleStats(amount){let aa=0,bb=0,ab=0;const n=4000;for(let i=0;i<n;i++){const t=1+i/rate,a=Math.sin(tau*432*t),b=Math.sin(tau*432*t+phase(t,amount));aa+=a*a;bb+=b*b;ab+=a*b;}return [aa/n,bb/n,ab/n];}
  function clearMedia(){if(audio){audio.onplaying=audio.onended=audio.onerror=null;audio.pause();audio.removeAttribute('src');audio.load();audio.remove();audio=null;}}
  function stop(){token++;active=false;cancelAnimationFrame(frame);clearTimeout(watchdog);clearMedia();if(source){source.onended=null;try{source.stop();}catch(e){}source.disconnect();source=null;}if(audioContext){const closing=audioContext;audioContext=null;closing.close().catch(()=>{});}play.textContent=viewing===1?'Listen & look · 27 seconds':'Replay with labels · 27 seconds';}
  function makeClip(){const count=rate*27,buffer=new ArrayBuffer(44+count*2),v=new DataView(buffer);const put=(offset,s)=>{for(let i=0;i<s.length;i++)v.setUint8(offset+i,s.charCodeAt(i));};put(0,'RIFF');v.setUint32(4,36+count*2,true);put(8,'WAVE');put(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,rate,true);v.setUint32(28,rate*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);put(36,'data');v.setUint32(40,count*2,true);
    const bins=[];let aa=0,bb=0,ab=0;
    for(let i=0;i<count;i++){const t=(i%(rate*9))/rate,amount=envelope(t),a=Math.sin(tau*432*t),b=Math.sin(tau*432*t+phase(t,amount));aa+=a*a;bb+=b*b;ab+=a*b;const fade=Math.min(1,t/.02,(9-t)/.02);v.setInt16(44+2*i,Math.round((a+b)*.08*fade*32767),true);if((i+1)%400===0){bins.push([aa/400,bb/400,ab/400]);aa=bb=ab=0;}}
    const bytes=new Uint8Array(buffer),pcm=new Float32Array(count);let binary='';
    for(let i=0;i<bytes.length;i+=16384)binary+=String.fromCharCode(...bytes.subarray(i,i+16384));
    for(let i=0;i<count;i++)pcm[i]=v.getInt16(44+2*i,true)/32768;
    return {dataUrl:'data:audio/wav;base64,'+btoa(binary),pcm,bins};
  }
  const clip=makeClip();
  play.addEventListener('click',()=>{if(active){stop();status.textContent='Stopped · sound off.';return;}active=true;next.hidden=true;const run=++token;play.textContent='Stop';status.textContent='Starting sound…';
    // Both playback paths are prepared by this tap; no network or blob URL is needed.
    let ready=Promise.resolve(false),context=null;
    try{const AudioCtor=window.AudioContext||window.webkitAudioContext;if(AudioCtor){context=new AudioCtor();audioContext=context;ready=Promise.resolve(context.resume()).then(()=>context.state==='running',()=>false);}}catch(e){}
    let fallback=false,clock=()=>0;
    const fail=()=>{if(run!==token)return;stop();status.textContent='Audio is unavailable in this view. Tap to retry.';};
    const finish=()=>{if(run!==token)return;stop();draw([.5,.5,.5]);cycleLabel.textContent='3 of 3 cycles complete';before.hidden=false;if(viewing===1){next.hidden=false;status.textContent='First viewing complete. Take a moment to notice.';}else{after.hidden=false;status.textContent='Second viewing complete. The sound and pattern were identical.';}};
    async function useDirect(){if(run!==token||fallback)return;fallback=true;clearMedia();clearTimeout(watchdog);watchdog=setTimeout(fail,8000);const running=await ready;if(run!==token)return;if(!running||!context){fail();return;}try{const buffer=context.createBuffer(1,clip.pcm.length,rate);buffer.copyToChannel(clip.pcm,0);source=context.createBufferSource();source.buffer=buffer;source.connect(context.destination);source.onended=finish;const start=context.currentTime;clock=()=>Math.max(0,context.currentTime-start);source.start();clearTimeout(watchdog);tick();}catch(e){fail();}}
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;let lastDraw=-1,lastStage='',lastCycle=0;
    function tick(){if(run!==token)return;const elapsed=clock(),t=elapsed%9,cycle=Math.min(3,Math.floor(elapsed/9)+1),amount=envelope(t),bin=Math.min(clip.bins.length-1,Math.floor(elapsed*120));mark(amount);if(elapsed-lastDraw>(reduced?.25:.06)||lastDraw<0){const stats=[0,0,0],start=Math.max(0,bin-9);for(let b=start;b<=bin;b++)for(let j=0;j<3;j++)stats[j]+=clip.bins[b][j]/(bin-start+1);draw(stats);lastDraw=elapsed;}const stage=viewing===1?'Listen and look':t<1.5?'Steady':t<3.5?'Becoming less steady':t<5.5?'Fluctuating':t<7.5?'Becoming steadier':'Steady again';if(stage!==lastStage){label.textContent=stage;lastStage=stage;}if(cycle!==lastCycle){cycleLabel.textContent='Cycle '+cycle+' of 3';status.textContent='Playing · '+(viewing===1?'without descriptive labels':'with labels');lastCycle=cycle;}frame=requestAnimationFrame(tick);}
    try{const current=document.createElement('audio');current.preload='auto';current.setAttribute('playsinline','');current.hidden=true;root.appendChild(current);audio=current;current.src=clip.dataUrl;clock=()=>current.currentTime;current.onplaying=()=>{if(run!==token||fallback)return;clearTimeout(watchdog);tick();};current.onended=finish;current.onerror=useDirect;watchdog=setTimeout(useDirect,3000);const p=current.play();if(p)p.catch(useDirect);}catch(e){useDirect();}
  });
  next.addEventListener('click',()=>{stop();viewing=2;next.hidden=true;before.hidden=true;after.hidden=true;step.textContent='Second viewing · same sound and pattern, with labels';play.textContent='Replay with labels · 27 seconds';status.textContent='The words will appear above the pattern.';label.textContent='Words appear here';cycleLabel.textContent='3 cycles · 9 seconds each';draw([.5,.5,.5]);});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();status.textContent='Paused · sound off.';}});window.addEventListener('pagehide',stop);
  new MutationObserver(()=>{colors=[color('#csp-base'),color('#csp-color')];draw(last);}).observe(document.documentElement,{attributes:true,attributeFilter:['class','style','data-theme']});
  draw(last);
})();
