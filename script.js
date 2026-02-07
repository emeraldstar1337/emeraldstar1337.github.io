let scene, camera, renderer, pepperCan;
let dsScene, dsCamera, dsRenderer, deathStar;

function init3D() {
    // 1. SCENE DR PEPPER
    const container = document.getElementById('pepper-canvas-container');
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(35, container.offsetWidth / container.offsetHeight, 0.1, 1000);
    camera.position.set(0, 0, 8); // Zoom out further to fit can

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 1.2));
    const pLight = new THREE.PointLight(0xbc6ff1, 1.5);
    pLight.position.set(5, 5, 5);
    scene.add(pLight);

    const loader = new THREE.GLTFLoader();
    
    // Load Dr Pepper Can
    loader.load('assets/dr_pepper_can.glb', (gltf) => {
        pepperCan = gltf.scene;
        pepperCan.scale.set(2, 2, 2); 
        pepperCan.position.y = -0.5;
        scene.add(pepperCan);
    }, undefined, () => {
        // Fallback cylinder if file not found
        const geo = new THREE.CylinderGeometry(1, 1, 2.8, 32);
        const mat = new THREE.MeshStandardMaterial({ color: 0x7a0000, metalness: 0.9, roughness: 0.1 });
        pepperCan = new THREE.Mesh(geo, mat);
        scene.add(pepperCan);
    });

    // 2. SCENE DEATH STAR
    const dsContainer = document.getElementById('death-star-overlay');
    dsScene = new THREE.Scene();
    dsCamera = new THREE.PerspectiveCamera(40, 1, 0.1, 1000);
    dsCamera.position.z = 5;

    dsRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    dsRenderer.setSize(400, 400);
    dsContainer.appendChild(dsRenderer.domElement);

    dsScene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dsLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dsLight.position.set(5, 5, 5);
    dsScene.add(dsLight);

    // Load Death Star Model
    loader.load('assets/death_star.glb', (gltf) => {
        deathStar = gltf.scene;
        deathStar.scale.set(1.5, 1.5, 1.5);
        dsScene.add(deathStar);
    }, undefined, () => {
        // Fallback wire-sphere
        deathStar = new THREE.Mesh(
            new THREE.SphereGeometry(1.5, 32, 32),
            new THREE.MeshStandardMaterial({ color: 0x333333, wireframe: true })
        );
        dsScene.add(deathStar);
    });
}

function animate() {
    requestAnimationFrame(animate);
    if (pepperCan) {
        pepperCan.rotation.y += 0.008; // Slower rotation
    }
    if (deathStar) {
        deathStar.rotation.y += 0.005;
    }
    renderer.render(scene, camera);
    dsRenderer.render(dsScene, dsCamera);
}

// INTERACTION: STAR TRIGGER
const trigger = document.getElementById('star-trigger');
const overlay = document.getElementById('death-star-overlay');
trigger.onmouseenter = () => overlay.classList.add('visible');
trigger.onmouseleave = () => overlay.classList.remove('visible');

// INTERACTION: LIBERTARIAN SNAKE
const snakeTrigger = document.getElementById('snake-trigger');
const snake = document.getElementById('snake-container');
snakeTrigger.onclick = () => {
    snake.classList.remove('snake-crawl');
    void snake.offsetWidth; // Trigger reflow
    snake.classList.add('snake-crawl');
};

// IDLE EASTER EGG
let idleTime = 0;
document.onmousemove = () => idleTime = 0;
setInterval(() => {
    idleTime++;
    if (idleTime > 15) {
        const banan = document.getElementById('john-banan');
        banan.classList.add('active');
        banan.onmouseenter = banan.onclick = () => {
            banan.style.transform = "translateX(-50%) translateY(-300px)";
            banan.style.opacity = "0";
        };
    }
}, 1000);

// Parallax Background
document.addEventListener('mousemove', (e) => {
    const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
    const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
    document.getElementById('bg').style.transform = `translate(${moveX}px, ${moveY}px) scale(1.1)`;
});

init3D();
animate();
