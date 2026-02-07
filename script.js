let scene, camera, renderer, pepperCan;
let dsScene, dsCamera, dsRenderer, deathStar;

function init3D() {
    const container = document.getElementById('pepper-canvas-container');
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(35, container.offsetWidth / container.offsetHeight, 0.1, 1000);
    camera.position.set(0, 0, 10);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 1.5));
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);

    const loader = new THREE.GLTFLoader();
    
    loader.load('assets/dr_pepper_can.glb', (gltf) => {
        pepperCan = gltf.scene;
        const box = new THREE.Box3().setFromObject(pepperCan);
        const center = box.getCenter(new THREE.Vector3());
        pepperCan.position.sub(center);
        pepperCan.scale.set(1.8, 1.8, 1.8);
        scene.add(pepperCan);
    }, undefined, () => {
        const geo = new THREE.CylinderGeometry(1, 1, 2.5, 32);
        const mat = new THREE.MeshStandardMaterial({ color: 0x7a0000, metalness: 0.8 });
        pepperCan = new THREE.Mesh(geo, mat);
        scene.add(pepperCan);
    });

    const dsContainer = document.getElementById('death-star-overlay');
    dsScene = new THREE.Scene();
    dsCamera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
    dsCamera.position.set(0, 0, 14);

    dsRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    dsRenderer.setSize(window.innerWidth, window.innerHeight);
    dsContainer.appendChild(dsRenderer.domElement);

    dsScene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dsl = new THREE.DirectionalLight(0xffffff, 1);
    dsl.position.set(5, 5, 5);
    dsScene.add(dsl);

    loader.load('assets/death_star.glb', (gltf) => {
        deathStar = gltf.scene;
        const box = new THREE.Box3().setFromObject(deathStar);
        const center = box.getCenter(new THREE.Vector3());
        deathStar.position.sub(center);
        deathStar.scale.set(2.5, 2.5, 2.5);
        dsScene.add(deathStar);
    }, undefined, () => {
        deathStar = new THREE.Mesh(
            new THREE.SphereGeometry(2.5, 32, 32),
            new THREE.MeshStandardMaterial({ color: 0x444444, wireframe: true })
        );
        dsScene.add(deathStar);
    });
}

function animate() {
    requestAnimationFrame(animate);
    if (pepperCan) pepperCan.rotation.y += 0.008;
    if (deathStar) deathStar.rotation.y += 0.005;
    renderer.render(scene, camera);
    dsRenderer.render(dsScene, dsCamera);
}

const trigger = document.getElementById('star-trigger');
const dsOverlay = document.getElementById('death-star-overlay');
trigger.addEventListener('mouseenter', () => dsOverlay.classList.add('visible'));
trigger.addEventListener('mouseleave', () => dsOverlay.classList.remove('visible'));

const snakeTrigger = document.getElementById('snake-trigger');
const snakeImg = document.getElementById('snake-img');
snakeTrigger.onclick = () => {
    snakeImg.classList.add('visible');
    setTimeout(() => { snakeImg.classList.remove('visible'); }, 2000);
};

let idleTime = 0;
const banan = document.getElementById('john-banan');
document.addEventListener('mousemove', () => { idleTime = 0; });
setInterval(() => {
    idleTime++;
    if (idleTime > 15) banan.classList.add('active');
}, 1000);

banan.onclick = () => {
    banan.style.opacity = '0';
    banan.style.transform = 'translateX(-50%) translateY(-100px)';
    setTimeout(() => { banan.classList.remove('active'); banan.style.opacity = '1'; }, 600);
};

init3D();
animate();
