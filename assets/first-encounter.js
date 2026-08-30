(() => {
  const doors=[...document.querySelectorAll('.door-card')];
  const note=document.querySelector('.field-note');
  const messages={
    idea:['IDEA MODE','Wonderful. Keep it light enough to move and real enough to learn. Start with what you are trying to make possible—and who actually decides.'],
    build:['BUILD MODE','You already have momentum. Find the next consequential decision, notice what it touches, and choose the smallest truthful next move.'],
    reset:['REALITY REPLIED','Something not working is information, not a verdict. Notice what reality may be correcting before deciding what should change.'],
    decision:['DECISION MODE','Big decisions deserve enough room to see clearly: authority, affected field, permission, evidence, reversibility, and return.'],
    curious:['CURIOSITY MODE','Perfect. You do not need a project to explore. Wander, notice, visit the Number Lab, and follow what makes you curious.']
  };
  doors.forEach(door=>{
    door.setAttribute('aria-expanded','false');
    door.addEventListener('click',()=>{
      doors.forEach(d=>{d.classList.remove('active');d.setAttribute('aria-expanded','false')});
      door.classList.add('active');door.setAttribute('aria-expanded','true');
      const m=messages[door.dataset.mode];
      if(note&&m) note.innerHTML=`<b>${m[0]}:</b> ${m[1]}`;
    });
  });
})();