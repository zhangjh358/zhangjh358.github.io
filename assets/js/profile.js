document.addEventListener('DOMContentLoaded',()=>{
  const body=document.body,nav=document.querySelector('nav'),menu=document.querySelector('.menu'),language=document.querySelector('.language');
  menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',open)});
  nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));
  language.addEventListener('click',()=>{const en=body.classList.toggle('en');document.documentElement.lang=en?'en':'zh-CN';language.textContent=en?'中文':'English';document.querySelectorAll('[data-en]').forEach(el=>{if(!el.dataset.zh)el.dataset.zh=el.textContent;el.textContent=en?el.dataset.en:el.dataset.zh})});
});
