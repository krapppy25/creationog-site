
(() => {
  const root=document.getElementById('pitch-pattern-experience');
  const play=root.querySelector('#shape-play'),next=root.querySelector('#shape-next'),status=root.querySelector('#shape-status'),cycle=root.querySelector('#shape-cycle');
  const step=root.querySelector('#shape-step'),label=root.querySelector('#shape-label'),direction=root.querySelector('#shape-direction'),notes=root.querySelector('#shape-notes');
  const canvas=root.querySelector('#shape-canvas'),pen=canvas.getContext('2d');
  const rate=48000,duration=27,tau=Math.PI*2;
  function frequency(t){const x=t%9;if(x<1.5)return 432;if(x<3.5)return 432+4*(1-Math.cos(Math.PI*(x-1.5)/2));if(x<5.5)return 440;if(x<7.5)return 440-4*(1-Math.cos(Math.PI*(x-5.5)/2));return 432;}
  function makeClip(){
    const n=rate*duration,one=new Int16Array(rate*9);let phase=0;
    for(let i=0;i<one.length;i++){const t=i/rate,fade=Math.min(1,t/.02,(9-t)/.02);one[i]=Math.round(Math.sin(phase)*.12*fade*32767);phase=(phase+tau*frequency((i+.5)/rate)/rate)%tau;}
    const buffer=new ArrayBuffer(44+n*2),v=new DataView(buffer),pcm=new Float32Array(n);const put=(o,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i));};
    put(0,'RIFF');v.setUint32(4,36+n*2,true);put(8,'WAVE');put(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,rate,true);v.setUint32(28,rate*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);put(36,'data');v.setUint32(40,n*2,true);
    for(let i=0;i<n;i++){const s=one[i%one.length];v.setInt16(44+2*i,s,true);pcm[i]=s/32768;}
    const bytes=new Uint8Array(buffer);let binary='';for(let i=0;i<bytes.length;i+=16384)binary+=String.fromCharCode(...bytes.subarray(i,i+16384));return {pcm,dataUrl:'data:audio/wav;base64,'+btoa(binary)};
  }
  const clip=makeClip();
  // Fixed-edge rectangular membrane; no sand transport is modeled.
  // Quasi-steady damped modal response, evaluated at the audible drive frequency.
  // Lx=1 m, Ly=.98 m, c=239 m/s, damping ratio=.0035, point drive (.31,.41) in normalized coordinates.
  // Geometry is illustrative: nearby (3,2)/(2,3) modes lie at 433.59/436.97 Hz.
  // Relative contrast is normalized each frame; color is NOT an absolute vibration or coherence score.
  const W=canvas.width,H=canvas.height,modes=[];
  for(let m=1;m<=5;m++)for(let n=1;n<=5;n++){
    const basis=new Float32Array(W*H);
    for(let y=0;y<H;y++)for(let x=0;x<W;x++)basis[y*W+x]=Math.sin(m*Math.PI*x/(W-1))*Math.sin(n*Math.PI*y/(H-1));
    modes.push({basis,f:119.5*Math.sqrt(m*m+(n/.98)**2),coupling:Math.sin(m*Math.PI*.31)*Math.sin(n*Math.PI*.41)});
  }
  function field(hz){
    const re=new Float32Array(W*H),im=new Float32Array(W*H);
    for(const mode of modes){const a=mode.f*mode.f-hz*hz,b=2*.0035*mode.f*hz,d=a*a+b*b,wr=mode.coupling*a/d,wi=-mode.coupling*b/d;for(let i=0;i<re.length;i++){re[i]+=wr*mode.basis[i];im[i]+=wi*mode.basis[i];}}
    const energy=new Float32Array(W*H);let peak=0;
    for(let i=0;i<energy.length;i++){energy[i]=re[i]*re[i]+im[i]*im[i];peak=Math.max(peak,energy[i]);}
    return {energy,peak};
  }
  function rgb(id){const c=document.createElement('canvas');c.width=c.height=1;const p=c.getContext('2d');p.fillStyle=getComputedStyle(root.querySelector(id)).color;p.fillRect(0,0,1,1);return p.getImageData(0,0,1,1).data;}
  let colors=[rgb('#shape-base'),rgb('#shape-color')];
  let viewing=1,audio=null,audioContext=null,source=null,active=false,frame=0,token=0,watchdog=0,lastHz=432;
  function draw(hz){lastHz=hz;label.textContent=viewing===1?'Listen and look':hz.toFixed(1)+' Hz';const {energy,peak}=field(hz),img=pen.createImageData(W,H);for(let i=0;i<energy.length;i++){const q=Math.exp(-energy[i]/Math.max(peak*0.018,1e-30));for(let j=0;j<3;j++)img.data[i*4+j]=Math.round(colors[0][j]*(1-q)+colors[1][j]*q);img.data[i*4+3]=255;}pen.putImageData(img,0,0);}
  function clearMedia(){if(audio){audio.onplaying=audio.onended=audio.onerror=null;audio.pause();audio.removeAttribute('src');audio.load();audio.remove();audio=null;}}
  function stop(){token++;active=false;cancelAnimationFrame(frame);clearTimeout(watchdog);clearMedia();if(source){source.onended=null;try{source.stop();}catch(e){}source.disconnect();source=null;}if(audioContext){const closing=audioContext;audioContext=null;closing.close().catch(()=>{});}play.textContent=viewing===1?'Listen & look · 27 seconds':'Replay with pitch labels · 27 seconds';}
  next.addEventListener('click',()=>{stop();viewing=2;next.hidden=true;step.textContent='Second viewing · identical sound and pattern, with pitch labels';play.textContent='Replay with pitch labels · 27 seconds';status.textContent='Ready · 432 → 440 → 432 Hz';cycle.textContent='3 cycles · 9 seconds each';direction.textContent='Pitch labels revealed';draw(432);});
  play.addEventListener('click',()=>{
    if(active){stop();status.textContent='Stopped · sound off.';return;}
    active=true;next.hidden=true;const run=++token;play.textContent='Stop';status.textContent='Starting sound…';
    let ready=Promise.resolve(false),context=null;
    try{const Ctor=window.AudioContext||window.webkitAudioContext;if(Ctor){context=new Ctor();audioContext=context;ready=Promise.resolve(context.resume()).then(()=>context.state==='running',()=>false);}}catch(e){}
    let fallback=false,clock=()=>0,lastCycle=0,lastDraw=-1,lastStage='';const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fail=()=>{if(run!==token)return;stop();status.textContent='Sound could not start. Tap to retry.';};
    const finish=()=>{if(run!==token)return;stop();draw(432);cycle.textContent='3 of 3 cycles complete';notes.hidden=false;if(viewing===1){next.hidden=false;status.textContent='First viewing complete · what did you notice?';}else{status.textContent='Second viewing complete · did the labels change your experience?';direction.textContent='Back at 432 Hz · sound off';}};
    function tick(){if(run!==token)return;const t=Math.min(duration,clock()),x=t%9,c=Math.min(3,Math.floor(t/9)+1);if(t-lastDraw>(reduced?.25:.08)||lastDraw<0){draw(frequency(t));lastDraw=t;}if(c!==lastCycle){cycle.textContent='Cycle '+c+' of 3';status.textContent='Playing · '+(viewing===1?'without pitch labels':'with pitch labels');lastCycle=c;}const stage=viewing===1?'Sound · Pattern · Perception':x<1.5?'Holding at 432 Hz':x<3.5?'Rising toward 440 Hz':x<5.5?'Holding at 440 Hz':x<7.5?'Returning toward 432 Hz':'Holding at 432 Hz';if(stage!==lastStage){direction.textContent=stage;lastStage=stage;}frame=requestAnimationFrame(tick);}
    async function useDirect(){if(run!==token||fallback)return;fallback=true;clearMedia();clearTimeout(watchdog);watchdog=setTimeout(fail,8000);const running=await ready;if(run!==token)return;if(!running||!context){fail();return;}try{const buffer=context.createBuffer(1,clip.pcm.length,rate);buffer.copyToChannel(clip.pcm,0);source=context.createBufferSource();source.buffer=buffer;source.connect(context.destination);source.onended=finish;const start=context.currentTime;clock=()=>Math.max(0,context.currentTime-start);source.start();clearTimeout(watchdog);tick();}catch(e){fail();}}
    try{const current=document.createElement('audio');current.preload='auto';current.setAttribute('playsinline','');current.hidden=true;root.appendChild(current);audio=current;current.src=clip.dataUrl;clock=()=>current.currentTime;current.onplaying=()=>{if(run!==token||fallback)return;clearTimeout(watchdog);cancelAnimationFrame(frame);tick();};current.onended=finish;current.onerror=useDirect;watchdog=setTimeout(useDirect,3000);const p=current.play();if(p)p.catch(useDirect);}catch(e){useDirect();}
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&active){stop();status.textContent='Stopped while away · tap to restart.';}});window.addEventListener('pagehide',stop);
  new MutationObserver(()=>{colors=[rgb('#shape-base'),rgb('#shape-color')];draw(lastHz);}).observe(document.documentElement,{attributes:true,attributeFilter:['class','style','data-theme']});draw(432);
})();

for(const link of document.querySelectorAll('.pitch-history a[href^="#pitch-source-"]')){link.addEventListener('click',()=>{const target=document.getElementById(link.hash.slice(1));if(target)target.closest('details').open=true;});}
