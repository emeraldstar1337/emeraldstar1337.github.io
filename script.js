let scene, camera, renderer, pepperCan;
let dsScene, dsCamera, dsRenderer, deathStar;

// Инициализация 3D
function init3D() {
    // 1. Сцена для Dr Pepper
    const container = document.getElementById('pepper-canvas-container');
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(40, container.offsetWidth / container.offsetHeight, 0.1, 1000);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Свет
    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambient);
    const point = new THREE.PointLight(0xbc6ff1, 2);
    point.position.set(2, 2, 2);
    scene.add(point);

    // Создаем банку программно (цилиндр), если GLB не подгрузится, 
    // чтобы она ГАРАНТИРОВАННО была видна.
    const geometry = new THREE.CylinderGeometry(1, 1, 2.2, 32);
    const material = new THREE.MeshStandardMaterial({ 
        color: 0x8b0000, 
        metalness: 0.9, 
        roughness: 0.1,
        emissive: 0x220000 
    });
    pepperCan = new THREE.Mesh(geometry, material);
    scene.add(pepperCan);

    // 2. Сцена для Звезды Смерти
    const dsContainer = document.getElementById('death-star-overlay');
    dsScene = new THREE.Scene();
    dsCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    dsCamera.position.z = 3;

    dsRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    dsRenderer.setSize(300, 300);
    dsContainer.appendChild(dsRenderer.domElement);

    const dsLight = new THREE.DirectionalLight(0xffffff, 1);
    dsLight.position.set(5, 5, 5);
    dsScene.add(dsLight);
    dsScene.add(new THREE.AmbientLight(0xbc6ff1, 0.5));

    // Создаем "красивую" звезду смерти через геометрию
    const dsGeo = new THREE.SphereGeometry(1, 32, 32);
    const dsMat = new THREE.MeshStandardMaterial({ 
        color: 0x333333, 
        metalness: 1, 
        roughness: 0.4,
        wireframe: true // Технологичный вид
    });
    deathStar = new THREE.Group();
    const core = new THREE.Mesh(dsGeo, dsMat);
    
    // Добавляем "впадину" для лазера
    const laserGeo = new THREE.CircleGeometry(0.3, 32);
    const laserMat = new THREE.MeshBasicMaterial({ color: 0xbc6ff1, side: THREE.DoubleSide });
    const laserHole = new THREE.Mesh(laserGeo, laserMat);
    laserHole.position.set(0.5, 0.5, 0.8);
    
    deathStar.add(core);
    deathStar.add(laserHole);
    dsScene.add(deathStar);
}

function animate() {
    requestAnimationFrame(animate);
    if (pepperCan) {
        pepperCan.rotation.y += 0.02;
        pepperCan.rotation.z = Math.sin(Date.now() * 0.001) * 0.1;
    }
    if (deathStar) {
        deathStar.rotation.y += 0.01;
    }
    renderer.render(scene, camera);
    dsRenderer.render(dsScene, dsCamera);
}

// Пасхалка: Star
const trigger = document.getElementById('star-trigger');
const overlay = document.getElementById('death-star-overlay');

const showStar = () => overlay.classList.add('visible');
const hideStar = () => overlay.classList.remove('visible');

trigger.addEventListener('mouseenter', showStar);
trigger.addEventListener('mouseleave', hideStar);
trigger.addEventListener('touchstart', (e) => {
    e.preventDefault();
    overlay.classList.toggle('visible');
});

// Пасхалка: John Banan
let bananShown = false;
let idleTime = 0;

document.onmousemove = document.onkeypress = document.ontouchstart = () => {
    idleTime = 0;
};

setInterval(() => {
    idleTime++;
    if (idleTime > 15 && !bananShown) {
        const banan = document.getElementById('john-banan');
        banan.classList.add('active');
        bananShown = true;
        
        banan.onclick = () => {
            banan.classList.add('fly');
        };
    }
}, 1000);

// Parallax
document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    document.getElementById('bg').style.transform = `translate(${x}px, ${y}px) scale(1.1)`;
});

init3D();
animate();