'use strict';
const $ = (selector) => document.querySelector(selector);
const intro = $('.intro');
const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
let reducedMotion = motionQuery.matches;
let motionPreference = null;
let introTimer;
function finishIntro() { intro.classList.add('finished'); }
function playIntro() {
  clearTimeout(introTimer);
  if (reducedMotion) return finishIntro();
  intro.classList.remove('finished');
  intro.getAnimations({ subtree: true }).forEach(animation => { animation.cancel(); animation.play(); });
  introTimer = setTimeout(finishIntro, 2500);
}
playIntro();
$('#replay').addEventListener('click', () => { window.scrollTo({ top: 0, behavior: 'instant' }); playIntro(); });

const sculpture = $('.sculpture');
const scene = $('.scene');
let rotation = 0, pointerX = 0, pointerY = 0, dragging = false, lastX = 0, separated = false, pendingFrame = false;
function renderScene() {
  pendingFrame = false;
  const progress = reducedMotion ? 0 : Math.min(window.scrollY / Math.max($('.hero').offsetHeight, 1), 1);
  sculpture.style.setProperty('--rx', `${-24 + (reducedMotion ? 0 : pointerY * 5) + progress * 14}deg`);
  sculpture.style.setProperty('--ry', `${-33 + rotation + (reducedMotion ? 0 : pointerX * 9) + progress * 38}deg`);
  sculpture.style.setProperty('--rz', `${-13 + progress * 10}deg`);
  sculpture.style.setProperty('--spread', `${(separated ? 60 : 0) + progress * 45}px`);
}
function requestRender() { if (!pendingFrame) { pendingFrame = true; requestAnimationFrame(renderScene); } }
window.addEventListener('scroll', requestRender, { passive: true });
scene.addEventListener('pointerdown', event => {
  if (event.pointerType === 'mouse' && event.button !== 0) return;
  dragging = true; lastX = event.clientX; scene.setPointerCapture(event.pointerId);
});
scene.addEventListener('pointermove', event => {
  if (dragging) { rotation += (event.clientX - lastX) * .45; lastX = event.clientX; }
  else if (event.pointerType === 'mouse') {
    const bounds = scene.getBoundingClientRect();
    pointerX = (event.clientX - bounds.left) / bounds.width - .5;
    pointerY = (event.clientY - bounds.top) / bounds.height - .5;
  }
  requestRender();
});
['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => scene.addEventListener(type, () => { dragging = false; }));
scene.addEventListener('pointerleave', () => { pointerX = pointerY = 0; requestRender(); });
$('#rotate').addEventListener('click', () => { rotation += 45; requestRender(); });
$('#explode').addEventListener('click', event => {
  separated = !separated;
  event.currentTarget.setAttribute('aria-pressed', String(separated));
  event.currentTarget.innerHTML = separated ? 'Assemble <span aria-hidden="true">−</span>' : 'Separate <span aria-hidden="true">+</span>';
  requestRender();
});
function syncMotion() {
  reducedMotion = motionQuery.matches || motionPreference === false;
  document.body.classList.toggle('reduced-motion', reducedMotion);
  $('#motion').textContent = `Motion: ${reducedMotion ? 'off' : 'on'}`;
  $('#motion').setAttribute('aria-pressed', String(reducedMotion));
  $('#replay').disabled = reducedMotion;
  $('#replay').title = reducedMotion ? 'Entrance animation is disabled while reduced motion is enabled.' : '';
  if (reducedMotion) finishIntro();
  requestRender();
}
$('#motion').addEventListener('click', () => {
  if (motionQuery.matches) { $('#motion').textContent = 'Motion: off (system setting)'; return; }
  motionPreference = reducedMotion;
  syncMotion();
});
motionQuery.addEventListener('change', syncMotion);
syncMotion();

const components = {
  musl: { title: 'A lean foundation.', description: 'musl provides the C standard library at the heart of the target system. LTR builds its core around this compact foundation, with no GNU runtime libraries in the target image.', symbol: '{ }', foot: 'LIBRARY / musl' },
  dash: { title: 'A shell with a clear purpose.', description: 'dash handles the command shell in LTR’s source-built base. It sits alongside BusyBox utilities, giving the core a straightforward environment for scripts and everyday commands.', symbol: '>_', foot: 'SHELL / dash' },
  s6: { title: 'Bring the system to life.', description: 's6 and s6-linux-init provide the supervision and initialization foundation. In the boot-core image, s6 also runs wired DHCP networking, keeping that service under supervision.', symbol: '[ ]', foot: 'SUPERVISION / s6' }
};
const tabs = [...document.querySelectorAll('[data-component]')];
function activateTab(tab) {
  tabs.forEach(item => { const active = item === tab; item.classList.toggle('active', active); item.setAttribute('aria-selected', String(active)); item.tabIndex = active ? 0 : -1; });
  const component = components[tab.dataset.component];
  $('#component-title').textContent = component.title;
  $('#component-description').textContent = component.description;
  $('.component-symbol').textContent = component.symbol;
  $('#component-foot').textContent = component.foot;
  $('#component-panel').setAttribute('aria-labelledby', tab.id);
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateTab(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowDown') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowUp') next = (index + tabs.length - 1) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) { event.preventDefault(); activateTab(tabs[next]); tabs[next].focus(); }
  });
});
document.querySelectorAll('[data-arch]').forEach(button => button.addEventListener('click', () => {
  const architecture = button.dataset.arch;
  document.querySelectorAll('[data-arch]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  $('#build-command').textContent = architecture === 'i686' ? 'LTR_ARCH=i686 ./build-all.sh --all' : './build-all.sh --all';
  $('#output-path').textContent = `out/lighting-the-rain-transform-${architecture}-boot-core.iso`;
  $('#copy-status').textContent = '';
}));
$('#copy').addEventListener('click', async () => {
  const command = $('#build-command').textContent;
  try {
    await navigator.clipboard.writeText(command);
    $('#copy-status').textContent = 'Build command copied.';
  } catch {
    const selection = window.getSelection();
    const range = document.createRange(); range.selectNodeContents($('#build-command'));
    selection.removeAllRanges(); selection.addRange(range);
    $('#copy-status').textContent = 'Select Copy in your browser, or press Ctrl+C / ⌘C to copy the highlighted command.';
  }
});
