let scene, camera, renderer, pepperCan;
let dsScene, dsCamera, dsRenderer, deathStar;

function init3D() {
    // 1. SCENE DR PEPPER
    const container = document.getElementById('pepper-canvas-container');
    scene = new THREE.Scene();
    // Настраиваем камеру так, чтобы модель была видна издалека
    camera = new THREE.PerspectiveCamera(30, container.offsetWidth / container.offsetHeight, 0.1, 1000);
    camera.position.set(0, 0, 10); 

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 1.2));
    const light = new THREE.PointLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);

    const loader = new THREE.GLTFLoader();
    
    loader.load('assets/dr_pepper_can.glb', (gltf) => {
        pepperCan = gltf.scene;
        // Центрируем модель
        const box = new THREE.Box3().setFromObject(pepperCan);
        const center = box.getCenter(new THREE.Vector3());
        pepperCan.position.sub(center);
        pepperCan.scale.set(1.5, 1.5, 1.5);
        scene.add(pepperCan);
    }, undefined, () => {
        // Fallback если файла нет
        const geo = new THREE.CylinderGeometry(1, 1, 2.5, 32);
        const mat = new THREE.MeshStandardMaterial({ color: 0x7a0000, metalness: 0.8 });
        pepperCan = new THREE.Mesh(geo, mat);
        scene.add(pepperCan);
    });

    // 2. SCENE DEATH STAR
    const dsContainer = document.getElementById('death-star-overlay');
    dsScene = new THREE.Scene();
    dsCamera = new THREE.PerspectiveCamera(40, 1, 0.1, 1000);
    // Отодвигаем камеру подальше, чтобы видеть СНАРУЖИ
    dsCamera.position.set(0, 0, 12); 

    dsRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    dsRenderer.setSize(450, 450);
    dsContainer.appendChild(dsRenderer.domElement);

    dsScene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const dsLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dsLight.position.set(5, 5, 5);
    dsScene.add(dsLight);

    loader.load('assets/death_star.glb', (gltf) => {
        deathStar = gltf.scene;
        // Центрируем и масштабируем
        const box = new THREE.Box3().setFromObject(deathStar);
        const center = box.getCenter(new THREE.Vector3());
        deathStar.position.sub(center);
        deathStar.scale.set(2, 2, 2);
        dsScene.add(deathStar);
    }, undefined, () => {
        // Fallback wire-sphere
        deathStar = new THREE.Mesh(
            new THREE.SphereGeometry(2, 32, 32),
            new THREE.MeshStandardMaterial({ color: 0x444444, wireframe: true })
        );
        dsScene.add(deathStar);
    });
}

function animate() {
    requestAnimationFrame(animate);
    if (pepperCan) {
        pepperCan.rotation.y += 0.003; // ОЧЕНЬ медленное вращение
    }
    if (deathStar) {
        deathStar.rotation.y += 0.002;
    }
    renderer.render(scene, camera);
    dsRenderer.render(dsScene, dsCamera);
}

// ПАСХАЛКА: ЗВЕЗДА СМЕРТИ
const trigger = document.getElementById('star-trigger');
const overlay = document.getElementById('death-star-overlay');
trigger.onmouseenter = () => overlay.classList.add('visible');
trigger.onmouseleave = () => overlay.classList.remove('visible');

// ПАСХАЛКА: ЗМЕЯ (Don't tread on me)
const snakeTrigger = document.getElementById('snake-trigger');
const snake = document.getElementById('liberty-snake');
const handleSnake = () => {
    snake.classList.add('crawl');
    setTimeout(() => snake.classList.remove('crawl'), 3500);
};
snakeTrigger.onmouseenter = handleSnake;
snakeTrigger.onclick = handleSnake;

// ПАСХАЛКА: JOHN BANAN
let idleTime = 0;
document.onmousemove = () => idleTime = 0;
setInterval(() => {
    idleTime++;
    if (idleTime > 15) {
        const banan = document.getElementById('john-banan');
        banan.classList.add('active');
        banan.onclick = () => banan.style.display = 'none';
    }
}, 1000);

// Параллакс фона
document.addEventListener('mousemove', (e) => {
    const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
    const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
    document.getElementById('bg').style.transform = `translate(${moveX}px, ${moveY}px) scale(1.1)`;
});

init3D();
animate();
