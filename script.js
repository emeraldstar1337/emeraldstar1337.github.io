let scene, camera, renderer, pepperCan;
let dsScene, dsCamera, dsRenderer, deathStar;

function init3D() {
    // --- DR PEPPER SCENE ---
    const container = document.getElementById('pepper-canvas-container');
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(35, container.offsetWidth / container.offsetHeight, 0.1, 1000);
    camera.position.set(0, 0, 12); // Отодвинули камеру еще дальше

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 1.5));

    const loader = new THREE.GLTFLoader();
    
    loader.load('assets/dr_pepper_can.glb', (gltf) => {
        pepperCan = gltf.scene;
        // Авто-центрирование
        const box = new THREE.Box3().setFromObject(pepperCan);
        const center = box.getCenter(new THREE.Vector3());
        pepperCan.position.sub(center);
        pepperCan.scale.set(1.8, 1.8, 1.8);
        scene.add(pepperCan);
    }, undefined, () => {
        // Fallback если файл не найден
        pepperCan = new THREE.Mesh(
            new THREE.CylinderGeometry(1, 1, 2.5, 32),
            new THREE.MeshStandardMaterial({ color: 0x7a0000, metalness: 0.9 })
        );
        scene.add(pepperCan);
    });

    // --- DEATH STAR SCENE ---
    const dsContainer = document.getElementById('death-star-overlay');
    dsScene = new THREE.Scene();
    dsCamera = new THREE.PerspectiveCamera(40, 1, 0.1, 1000);
    dsCamera.position.set(0, 0, 15); // Еще дальше, чтобы точно видеть снаружи

    dsRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    dsRenderer.setSize(450, 450);
    dsContainer.appendChild(dsRenderer.domElement);

    dsScene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dsLight = new THREE.DirectionalLight(0xffffff, 1);
    dsLight.position.set(5, 5, 5);
    dsScene.add(dsLight);

    loader.load('assets/death_star.glb', (gltf) => {
        deathStar = gltf.scene;
        const box = new THREE.Box3().setFromObject(deathStar);
        const center = box.getCenter(new THREE.Vector3());
        deathStar.position.sub(center);
        deathStar.scale.set(3, 3, 3);
        dsScene.add(deathStar);
    }, undefined, () => {
        // Красивый fallback (сферическая сетка)
        deathStar = new THREE.Mesh(
            new THREE.SphereGeometry(2.5, 32, 32),
            new THREE.MeshStandardMaterial({ color: 0x444444, wireframe: true })
        );
        dsScene.add(deathStar);
    });
}

function animate() {
    requestAnimationFrame(animate);
    if (pepperCan) pepperCan.rotation.y += 0.003; // ОЧЕНЬ медленно
    if (deathStar) deathStar.rotation.y += 0.002;
    renderer.render(scene, camera);
    dsRenderer.render(dsScene, dsCamera);
}

// ПАСХАЛКА: ЗВЕЗДА СМЕРТИ
const trigger = document.getElementById('star-trigger');
const dsOverlay = document.getElementById('death-star-overlay');
trigger.onmouseenter = () => dsOverlay.classList.add('visible');
trigger.onmouseleave = () => dsOverlay.classList.remove('visible');

// ПАСХАЛКА: ЗМЕЯ
const snakeTrigger = document.getElementById('snake-trigger');
const snakeImg = document.getElementById('liberty-snake');
snakeTrigger.onclick = () => {
    snakeImg.classList.remove('animate-snake');
    void snakeImg.offsetWidth; // Магия для перезапуска анимации
    snakeImg.classList.add('animate-snake');
};

// ПАСХАЛКА: JOHN BANAN
let idleTime = 0;
document.onmousemove = () => { idleTime = 0; };
setInterval(() => {
    idleTime++;
    if (idleTime > 15) {
        document.getElementById('john-banan').classList.add('active');
    }
}, 1000);

init3D();
animate();
