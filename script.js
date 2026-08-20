const root = document.documentElement;
const boot = document.querySelector('.boot');
const eyeLetters = [...document.querySelectorAll('.eye-letter')];
const cursorData = document.querySelector('#cursor-data');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

setTimeout(() => boot?.classList.add('is-done'), reduceMotion ? 0 : 1750);

function blink() {
  if (reduceMotion || document.body.classList.contains('motion-off')) return;
  eyeLetters.forEach(eye => eye.classList.add('blink'));
  setTimeout(() => eyeLetters.forEach(eye => eye.classList.remove('blink')), 145);
  if (Math.random() > .72) setTimeout(blink, 310);
  setTimeout(blink, 2800 + Math.random() * 4900);
}
setTimeout(blink, 2700);

let targetX = innerWidth / 2, targetY = innerHeight / 2;
addEventListener('pointermove', event => {
  targetX = event.clientX; targetY = event.clientY;
  root.style.setProperty('--mx', `${targetX}px`);
  root.style.setProperty('--my', `${targetY}px`);
  cursorData.textContent = `X ${String(Math.round(targetX)).padStart(3,'0')} / Y ${String(Math.round(targetY)).padStart(3,'0')}`;
  const x = Math.max(-1, Math.min(1, (targetX / innerWidth - .5) * 2));
  const y = Math.max(-1, Math.min(1, (targetY / innerHeight - .5) * 2));
  eyeLetters.forEach(eye => {
    eye.style.setProperty('--px', `${x * .055}em`);
    eye.style.setProperty('--py', `${y * .035}em`);
  });
}, {passive:true});

const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) entry.target.classList.add('is-visible');
}), {threshold:.14});
document.querySelectorAll('.reveal').forEach(node => observer.observe(node));

const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('#site-nav');
menuButton.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded', open);
  menuButton.querySelector('span').textContent = open ? '−' : '+';
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('is-open'); menuButton.setAttribute('aria-expanded', 'false');
}));

const clock = document.querySelector('#clock');
function tick(){ clock.textContent = new Date().toLocaleTimeString('pt-BR', {hour12:false}); }
tick(); setInterval(tick, 1000);

const motionToggle = document.querySelector('#motion-toggle');
motionToggle.addEventListener('click', () => {
  const off = document.body.classList.toggle('motion-off');
  motionToggle.textContent = `MOTION: ${off ? 'OFF' : 'ON'}`;
});
