// script.js (module)
import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.152.2/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'https://unpkg.com/three@0.152.2/examples/jsm/loaders/RGBELoader.js';

// ---------- Death Star (hover + long tap) ----------
const starEl = document.querySelector('.star');
const death = document.getElementById('death-star');
let dsAnim = null;

function showDeathStar(x, y) {
  death.style.left = (x - death.clientWidth / 2) + 'px';
  death.style.top = (y - death.clientHeight / 2) + 'px';
  death.classList.add('spin');
}
function hideDeathStar() {
  death.classList.remove('spin');
}

// desktop hover
starEl.addEventListener('mousemove', e => showDeathStar(e.clientX, e.clientY));
starEl.addEventListener('mouseleave', hideDeathStar);

// mobile long tap
let touchTimer = null;
starEl.addEventListener('touchstart', e => {
  touchTimer = setTimeout(() => {
    const t = e.touches[0];
    showDeathStar(t.clientX, t.clientY);
  }, 500);
});
starEl.addEventListener('touchend', () => {
  clearTimeout(touchTimer);
  hideDeathStar();
});

// ---------- Idle message (1x per session) ----------
const idleEl = document.getElementById('idle');
let idleShown = sessionStorage.getItem('idleShown') === '1';
let idleTimer;
function scheduleIdle() {
  clearTimeout(idleTimer);
  if (idleShown) return;
  idleTimer = setTimeout(() => {
    idleEl.style.top = '20px';
    idleEl.style.opacity = '0.68';
    idleShown = true;
    sessionStorage.setItem('idleShown', '1');
    setTimeout(() => { idleEl.style.opacity = '0'; }, 4800);
  }, 18000);
}
['mousemove','scroll','click','touchstart','keydown'].forEach(ev => document.addEventListener(ev, scheduleIdle));
scheduleIdle();

// clicking links hides messages
document.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { hideDeathStar(); idleEl.style.opacity = '0'; }));

// ---------- Parallax for chrome backdrop ----------
const chromeBackdrop = document.querySelector('.chrome-backdrop');
document.addEventListener('mousemove', (e) => {
  const x = (e.clientX / window.innerWidth - 0.5) * 10;
  const y = (e.clientY / window.innerHeight - 0.5) * 6;
  chromeBackdrop.style.transform = `translate(${x}px, ${y}px) scale(1.01)`;
});

// ---------- Three.js scene (Dr Pepper .glb) ----------
const container = document.getElementById('pepper-canvas');
let renderer, scene, camera, model, pmremGenerator, envMap;

function initThree() {
  const width = container.clientWidth;
  const height = container.clientHeight;

  renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  container.appendChild(renderer.domElement);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
  camera.position.set(0, 0.8, 2.4);

  pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  // ambient + key light + rim
  scene.add(new THREE.AmbientLight(0xffffff, 0.45));
  const key = new THREE.DirectionalLight(0xffffff, 0.8);
  key.position.set(2, 4, 2);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x9b7bff, 0.65);
  rim.position.set(-2.5, -1.2, -1.8);
  scene.add(rim);

  // load chrome image as environment (use assets/chrome.jpg)
  const texLoader = new THREE.TextureLoader();
  texLoader.load('assets/chrome.jpg', (tex) => {
    tex.mapping = THREE.EquirectangularReflectionMapping;
    envMap = pmremGenerator.fromEquirectangular(tex).texture;
    scene.environment = envMap;
    scene.background = null;
  }, undefined, () => {
    // ignore failure - it's optional
  });

  // ground reflection (subtle)
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(10,10),
    new THREE.MeshStandardMaterial({ color:0x000000, metalness:0.1, roughness:0.9, transparent:true, opacity:0.0 })
  );
  ground.rotation.x = -Math.PI/2;
  ground.position.y = -0.9;
  scene.add(ground);

  // load model
  const loader = new GLTFLoader();
  loader.load('assets/dr_pepper.glb', gltf => {
    model = gltf.scene;
    // Normalize model size
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 1.0 / maxDim * 1.1;
    model.scale.setScalar(scale);

    // center
    box.setFromObject(model);
    box.getCenter(size);
    model.position.x -= size.x;
    model.position.y -= (box.min.y - (-0.5));

    // adjust materials for extra chrome/rim if standard
    model.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        if (o.material && 'metalness' in o.material) {
          o.material.metalness = Math.max(0.8, o.material.metalness || 0.8);
          o.material.roughness = Math.min(0.25, o.material.roughness || 0.25);
          o.material.envMapIntensity = 1.0;
          o.material.needsUpdate = true;
        }
      }
    });

    scene.add(model);
    animate();
  }, undefined, err => {
    // fallback: show 2D image if model fails
    console.warn('GLB load failed, fallback to image', err);
    const img = document.createElement('img');
    img.src = 'assets/dr_pepper_fallback.png';
    img.style.width = '120px';
    img.style.filter = 'drop-shadow(0 20px 40px rgba(0,0,0,0.6))';
    container.innerHTML = '';
    container.appendChild(img);
  });

  window.addEventListener('resize', onResize);
}

function onResize() {
  if (!renderer) return;
  const w = container.clientWidth;
  const h = container.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}

let last = 0;
function animate(t) {
  requestAnimationFrame(animate);
  const now = t || performance.now();
  const dt = (now - last) / 1000;
  last = now;
  if (model) {
    // slow spin around Y (around itself)
    model.rotation.y += 0.35 * dt; // radians per second
  }
  if (renderer) renderer.render(scene, camera);
}

// init three when container is present
if (container) {
  initThree();
}

// accelerate spin on hover
container.addEventListener('mouseenter', () => {
  if (!model) return;
  const accel = () => { if (model) model.rotation.y += 0.18; requestAnimationFrame(accel); };
}, {passive:true});

// ensure WebGL supported
if (!window.WebGLRenderingContext) {
  container.innerHTML = '<div class="small muted">WebGL not supported — fallback image will be used.</div>';
}
