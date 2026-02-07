import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/* =========================================
   SCENE 1: DR PEPPER (MAIN CARD)
   ========================================= */
function initDrPepper() {
    const container = document.getElementById('canvas-container');
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    
    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 3.5;
    camera.position.y = 0.5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(2, 2, 5);
    scene.add(dirLight);

    // Purple Rim Light
    const rimLight = new THREE.SpotLight(0x8a2be2, 5);
    rimLight.position.set(-2, 1, -2);
    rimLight.lookAt(0, 0, 0);
    scene.add(rimLight);

    // Model Loader
    const loader = new GLTFLoader();
    let model;

    loader.load('assets/dr_pepper.glb', (gltf) => {
        model = gltf.scene;
        
        // Center the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);
        
        scene.add(model);
    }, undefined, (error) => {
        console.error('Dr Pepper model not found. Using placeholder.');
        // Fallback geometry if file missing
        const geometry = new THREE.CylinderGeometry(0.5, 0.5, 1.5, 32);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x770000, 
            roughness: 0.2, 
            metalness: 0.8 
        });
        model = new THREE.Mesh(geometry, material);
        scene.add(model);
    });

    // Controls (disable zoom for cleanliness)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;

    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);
        
        if (model) {
            model.rotation.y += 0.005; // Slow rotation
        }
        
        renderer.render(scene, camera);
    }
    animate();

    // Resize Handler
    window.addEventListener('resize', () => {
        if (!container) return;
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;
        renderer.setSize(newWidth, newHeight);
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
    });
}

/* =========================================
   SCENE 2: DEATH STAR (EASTER EGG)
   ========================================= */
function initDeathStar() {
    const container = document.getElementById('death-star-container');
    const width = 300;
    const height = 300;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.z = 4;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    // Create Procedural Death Star (Wireframe + Sphere)
    const geometry = new THREE.IcosahedronGeometry(1.2, 1);
    
    // Wireframe Material (Tech look)
    const wireframeMat = new THREE.MeshBasicMaterial({ 
        color: 0xaaaaaa, 
        wireframe: true 
    });
    
    // Inner Core (Dark Chrome)
    const coreMat = new THREE.MeshStandardMaterial({
        color: 0x222222,
        metalness: 0.9,
        roughness: 0.2
    });

    const wireframeMesh = new THREE.Mesh(geometry, wireframeMat);
    const coreMesh = new THREE.Mesh(geometry, coreMat);
    
    const deathStarGroup = new THREE.Group();
    deathStarGroup.add(wireframeMesh);
    deathStarGroup.add(coreMesh);
    
    // The "Eye" of the Death Star (Simple indentation visual)
    const eyeGeo = new THREE.SphereGeometry(0.4, 32, 32);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x444444 });
    const eye = new THREE.Mesh(eyeGeo, eyeMat);
    eye.position.set(0.8, 0.5, 0.8);
    deathStarGroup.add(eye);

    scene.add(deathStarGroup);

    const light = new THREE.PointLight(0xffffff, 2, 100);
    light.position.set(2, 2, 2);
    scene.add(light);

    function animate() {
        requestAnimationFrame(animate);
        // Rotation around its own axis
        deathStarGroup.rotation.y -= 0.02;
        deathStarGroup.rotation.x += 0.005;
        renderer.render(scene, camera);
    }
    animate();
}

/* =========================================
   LOGIC & INTERACTIONS
   ========================================= */

// 1. Initialize 3D
initDrPepper();
initDeathStar();

// 2. Easter Egg: Hover "star"
const starTrigger = document.getElementById('star-trigger');
const dsContainer = document.getElementById('death-star-container');

// Desktop Hover
starTrigger.addEventListener('mouseenter', () => {
    dsContainer.style.opacity = '1';
});
starTrigger.addEventListener('mouseleave', () => {
    dsContainer.style.opacity = '0';
});

// Mobile Long Touch
let touchTimer;
starTrigger.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevent text selection
    touchTimer = setTimeout(() => {
        dsContainer.style.opacity = '1';
    }, 500); // 500ms for long press
});

starTrigger.addEventListener('touchend', () => {
    clearTimeout(touchTimer);
    dsContainer.style.opacity = '0';
});

// 3. Idle Timer (Jonh Banan 773)
let idleTime = 0;
const idleOverlay = document.getElementById('idle-overlay');
let overlayShown = false;

function resetTimer() {
    idleTime = 0;
}

// Increment timer
setInterval(() => {
    idleTime++;
    // 17 seconds threshold
    if (idleTime > 17 && !overlayShown) {
        idleOverlay.classList.remove('hidden');
        overlayShown = true; // Show only once per session
    }
}, 1000);

// Reset interactions
window.addEventListener('mousemove', resetTimer);
window.addEventListener('keypress', resetTimer);
window.addEventListener('scroll', resetTimer);
window.addEventListener('click', resetTimer);
window.addEventListener('touchstart', resetTimer);
