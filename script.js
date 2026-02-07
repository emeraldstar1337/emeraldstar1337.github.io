let scene, camera, renderer, pepperCan;
let dsScene, dsCamera, dsRenderer, deathStar;

function init3D() {
    // DR PEPPER SCENE
    const container = document.getElementById('pepper-canvas-container');
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(35, container.offsetWidth / container.offsetHeight, 0.1, 1000);
    camera.position.set(0, 0, 4.5);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambient);
    const spot = new THREE.SpotLight(0xbc6ff1, 2);
    spot.position.set(5, 5, 5);
    scene.add(spot);

    // Load User's Dr Pepper Model
    const loader = new THREE.GLTFLoader();
    loader.load('assets/dr_pepper_can.glb', (gltf) => {
        pepperCan = gltf.scene;
        pepperCan.scale.set(1.5, 1.5, 1.5);
        scene.add(pepperCan);
    }, undefined, (err) => {
        // Fallback: Elegant cylinder if model is missing
        const geo = new THREE.CylinderGeometry(0.8, 0.8, 2, 32);
        const mat = new THREE.MeshStandardMaterial({ color: 0x7a0000, metalness: 1, roughness: 0.2 });
        pepperCan = new THREE.Mesh(geo, mat);
        scene.add(pepperCan);
    });

    // DEATH STAR SCENE
    const dsContainer = document.getElementById('death-star-overlay');
    dsScene = new THREE.Scene();
    dsCamera = new THREE.PerspectiveCamera(40, 1, 0.1, 1000);
    dsCamera.position.z = 4;

    dsRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    dsRenderer.setSize(350, 350);
    dsContainer.appendChild(dsRenderer.domElement);

    const dsLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dsLight.position.set(5, 3, 5);
    dsScene.add(dsLight);
    dsScene.add(new THREE.AmbientLight(0xbc6ff1, 0.3));

    // Proper Death Star Build
    deathStar = new THREE.Group();
    const sphereGeo = new THREE.SphereGeometry(1.2, 50, 50);
    const sphereMat = new THREE.MeshStandardMaterial({ color: 0x222222, wireframe: true });
    const body = new THREE.Mesh(sphereGeo, sphereMat);
    
    // Dish (The Superlaser) - correctly positioned
    const dishGeo = new THREE.SphereGeometry(0.35, 32, 32, 0, Math.PI * 2, 0, 0.5);
    const dishMat = new THREE.MeshStandardMaterial({ color: 0x444444, side: THREE.DoubleSide });
    const dish = new THREE.Mesh(dishGeo, dishMat);
    
    // Position it in the northern hemisphere
    dish.position.set(0.6, 0.7, 0.8);
    dish.lookAt(0, 0, 0); 
    dish.position.multiplyScalar(1.05); // slightly push out

    deathStar.add(body);
    deathStar.add(dish);
    dsScene.add(deathStar);
}

function animate() {
    requestAnimationFrame(animate);
    if (pepperCan) {
        pepperCan.rotation.y += 0.015;
    }
    if (deathStar) {
        deathStar.rotation.y += 0.007;
    }
    renderer.render(scene, camera);
    dsRenderer.render(dsScene, dsCamera);
}

// Interactivity
const trigger = document.getElementById('star-trigger');
const overlay = document.getElementById('death-star-overlay');
trigger.onmouseenter = () => overlay.classList.add('visible');
trigger.onmouseleave = () => overlay.classList.remove('visible');

// Idle Easter Egg
let idleTime = 0;
document.onmousemove = () => idleTime = 0;
setInterval(() => {
    idleTime++;
    if (idleTime > 15) {
        const banan = document.getElementById('john-banan');
        banan.classList.add('active');
        banan.onclick = () => banan.classList.add('fly');
    }
}, 1000);

// Parallax background
document.addEventListener('mousemove', (e) => {
    const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
    const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
    document.getElementById('bg').style.transform = `translate(${moveX}px, ${moveY}px) scale(1.1)`;
});

init3D();
animate();
