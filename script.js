let dsScene, dsCamera, dsRenderer, deathStar;

const loader = new THREE.GLTFLoader();

dsScene = new THREE.Scene();
dsCamera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
dsCamera.position.set(0, 0, 45);

dsRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
dsRenderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('death-star-overlay').appendChild(dsRenderer.domElement);

dsScene.add(new THREE.AmbientLight(0xffffff, 1.3));
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5,5,5);
dsScene.add(light);

loader.load('assets/death_star.glb', gltf => {
    deathStar = gltf.scene;
    const box = new THREE.Box3().setFromObject(deathStar);
    const center = box.getCenter(new THREE.Vector3());
    deathStar.position.sub(center);
    deathStar.scale.set(4,4,4);
    dsScene.add(deathStar);
});

function animate() {
    requestAnimationFrame(animate);
    if (deathStar) deathStar.rotation.y += 0.003;
    dsRenderer.render(dsScene, dsCamera);
}
animate();

const trigger = document.getElementById('star-trigger');
const overlay = document.getElementById('death-star-overlay');

trigger.addEventListener('mouseenter', () => overlay.classList.add('visible'));
trigger.addEventListener('mouseleave', () => overlay.classList.remove('visible'));
trigger.addEventListener('touchstart', e => {
    e.preventDefault();
    overlay.classList.toggle('visible');
}, { passive: false });
