(() => {
  const doors=[...document.querySelectorAll('.journey-door')];
  const fieldNote=document.querySelector('.approved-note');
  const messages=[
    ['IDEA MODE','Wonderful. Keep it light enough to move and real enough to learn. Start with what you are trying to make possible—and who actually decides.'],
    ['BUILD MODE','You already have momentum. We do not need to restart. Find the next consequential decision, notice what it touches, and choose the smallest truthful next move.'],
    ['REALITY REPLIED','Something not working is information, not a verdict. Notice what reality is correcting before deciding what should change.'],
    ['DECISION MODE','Big decisions deserve enough room to see clearly. Slow down the consequential part: authority, affected field, permission, evidence, reversibility and return.'],
    ['CURIOSITY MODE','Perfect. You do not need a project to explore. Wander, notice, visit the Number Lab, and follow what makes you curious.']
  ];
  doors.forEach((door,i)=>{
    door.setAttribute('aria-expanded','false');
    door.addEventListener('click',()=>{
      doors.forEach(d=>{d.classList.remove('door-active');d.setAttribute('aria-expanded','false')});
      door.classList.add('door-active');door.setAttribute('aria-expanded','true');
      if(fieldNote){fieldNote.innerHTML=`<b>${messages[i][0]}:</b> ${messages[i][1]}`;fieldNote.classList.remove('field-note-pop');void fieldNote.offsetWidth;fieldNote.classList.add('field-note-pop');}
    });
  });
})();