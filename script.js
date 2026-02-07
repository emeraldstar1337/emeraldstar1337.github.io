// --- CONFIG & SCENE SETUP ---
let scene, camera, renderer, pepperCan, deathStar;
let idleTimer;
let bananTriggered = false;

const pepperContainer = document.getElementById('pepper-canvas-container');
const deathStarContainer = document.getElementById('death-star-container');

function init3D() {
    // Pepper Scene
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, pepperContainer.offsetWidth / pepperContainer.offsetHeight, 0.1, 1000);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(pepperContainer.offsetWidth, pepperContainer.offsetHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    pepperContainer.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(5, 5, 5);
    scene.add(mainLight);

    const purpleLight = new THREE.PointLight(0xa855f7, 2, 10);
    purpleLight.position.set(-2, 1, 2);
    scene.add(purpleLight);

    // Loader for Models
    const loader = new THREE.GLTFLoader();

    // Load Dr Pepper Can (Using a reliable public soda can model)
    // Note: In production, host your specific .glb in the assets folder
    loader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/SodaCan.glb', (gltf) => {
        pepperCan = gltf.scene;
        pepperCan.scale.set(10, 10, 10); // Adjust based on model scale
        pepperCan.rotation.x = 0.2;
        scene.add(pepperCan);
    });

    // Death Star Scene (Hidden by default)
    const dsScene = new THREE.Scene();
    const dsCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    dsCamera.position.z = 4;
    const dsRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    dsRenderer.setSize(window.innerWidth, window.innerHeight);
    deathStarContainer.appendChild(dsRenderer.domElement);

    const dsLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dsLight.position.set(2, 2, 5);
    dsScene.add(dsLight);

    loader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/LeePerrySmith/LeePerrySmith.glb', (gltf) => {
        // Placeholder for Death Star - in real case use a .glb of Death Star
        // Here we simulate the metal look with a sphere and tech texture if model not found
        const geometry = new THREE.SphereGeometry(1.5, 64, 64);
        const material = new THREE.MeshStandardMaterial({
            color: 0x444444,
            metalness: 1,
            roughness: 0.3,
            wireframe: false
        });
        deathStar = new THREE.Mesh(geometry, material);
        dsScene.add(deathStar);
    });

    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);
        
        if (pepperCan) {
            pepperCan.rotation.y += 0.01;
        }

        if (deathStar) {
            deathStar.rotation.y += 0.005;
        }

        renderer.render(scene, camera);
        dsRenderer.render(dsScene, dsCamera);
    }
    animate();

    // Handle Resize
    window.addEventListener('resize', () => {
        camera.aspect = pepperContainer.offsetWidth / pepperContainer.offsetHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(pepperContainer.offsetWidth, pepperContainer.offsetHeight);
    });
}

// --- PARALLAX EFFECT ---
document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth) - 0.5;
    const y = (e.clientY / window.innerHeight) - 0.5;
    const bg = document.getElementById('bg');
    bg.style.transform = `translate(${x * 30}px, ${y * 30}px) scale(1.1)`;
    
    resetIdleTimer();
});

// --- EASTER EGG: STAR / DEATH STAR ---
const starTrigger = document.getElementById('star-trigger');
starTrigger.addEventListener('mouseenter', () => {
    deathStarContainer.classList.add('visible');
});
starTrigger.addEventListener('mouseleave', () => {
    deathStarContainer.classList.remove('visible');
});

// Mobile Star Interaction
starTrigger.addEventListener('touchstart', (e) => {
    e.preventDefault();
    deathStarContainer.classList.toggle('visible');
});

// --- EASTER EGG: JOHN BANAN ---
function resetIdleTimer() {
    clearTimeout(idleTimer);
    if (!bananTriggered) {
        idleTimer = setTimeout(showBanan, 15000); // 15 seconds
    }
}

function showBanan() {
    if (bananTriggered) return;
    const egg = document.getElementById('easter-egg-container');
    egg.innerText = "Jonh Banan 773 is here.";
    egg.classList.add('active');
    bananTriggered = true;

    egg.onclick = () => {
        egg.classList.add('fly-away');
        // Simple particle/glow effect simulation
        egg.style.boxShadow = "0 0 100px 50px rgba(168, 85, 247, 0.8)";
    };
    
    egg.onmouseenter = () => {
        egg.style.transform = "translateX(-50%) translateY(-10px)";
    };
}

// Start everything
init3D();
resetIdleTimer();
