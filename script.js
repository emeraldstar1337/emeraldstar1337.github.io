/* DEATH STAR */
const star = document.querySelector('.star');
const ds = document.getElementById('death-star');

function showDS(x, y) {
  ds.style.left = x - 100 + 'px';
  ds.style.top = y - 100 + 'px';
  ds.style.opacity = '0.35';
}
function hideDS() {
  ds.style.opacity = '0';
}

star.addEventListener('mousemove', e => showDS(e.clientX, e.clientY));
star.addEventListener('mouseleave', hideDS);

// Mobile long tap
let press;
star.addEventListener('touchstart', e => {
  press = setTimeout(() => {
    const t = e.touches[0];
    showDS(t.clientX, t.clientY);
  }, 500);
});
star.addEventListener('touchend', () => {
  clearTimeout(press);
  hideDS();
});

/* IDLE MESSAGE */
const idle = document.getElementById('idle');
let shown = false;
let timer;

function resetIdle() {
  clearTimeout(timer);
  if (!shown) {
    timer = setTimeout(() => {
      idle.style.top = '20px';
      idle.style.opacity = '0.6';
      shown = true;
    }, 18000);
  }
}

['mousemove','scroll','click','touchstart'].forEach(e =>
  document.addEventListener(e, resetIdle)
);

resetIdle();
