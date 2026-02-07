let scene, camera, renderer, pepperCan;
let dsScene, dsCamera, dsRenderer, deathStar;

function init3D() {
    const container = document.getElementById('pepper-canvas-container');
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(35, container.offsetWidth / container.offsetHeight, 0.1, 1000);
    camera.position.set(0, 0, 8);

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
        const mat = new THREE.MeshStandardMaterial({ color: 0x7a0000, metalness: 0.8, roughness: 0.3 });
        pepperCan = new THREE.Mesh(geo, mat);
        scene.add(pepperCan);
    });

    const dsContainer = document.getElementById('death-star-overlay');
    dsScene = new THREE.Scene();
    dsCamera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
    dsCamera.position.set(0, 0, 15);

    dsRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    dsRenderer.setSize(window.innerWidth, window.innerHeight);
    dsRenderer.setPixelRatio(window.devicePixelRatio);
    dsRenderer.setClearColor(0x000000, 0);
    
    // Ensure canvas is appended
    if (dsContainer) {
        dsContainer.appendChild(dsRenderer.domElement);
        console.log('Death Star canvas appended to overlay');
    } else {
        console.error('Death Star overlay container not found!');
    }

    dsScene.add(new THREE.AmbientLight(0xffffff, 1.2));
    const dsl = new THREE.DirectionalLight(0xffffff, 1.5);
    dsl.position.set(5, 5, 5);
    dsScene.add(dsl);
    
    const dsl2 = new THREE.DirectionalLight(0xaaaaff, 0.8);
    dsl2.position.set(-5, -3, 5);
    dsScene.add(dsl2);

    // Create fallback immediately for testing
    deathStar = new THREE.Mesh(
        new THREE.SphereGeometry(4, 32, 32),
        new THREE.MeshStandardMaterial({ 
            color: 0x888888, 
            metalness: 0.7, 
            roughness: 0.3,
            emissive: 0x222222
        })
    );
    dsScene.add(deathStar);
    console.log('✓ Fallback Death Star created and added to scene');

    loader.load('assets/death_star.glb', (gltf) => {
        // Remove fallback
        dsScene.remove(deathStar);
        
        deathStar = gltf.scene;
        const box = new THREE.Box3().setFromObject(deathStar);
        const center = box.getCenter(new THREE.Vector3());
        deathStar.position.sub(center);
        deathStar.scale.set(3.5, 3.5, 3.5);
        dsScene.add(deathStar);
        console.log('✓ Death Star GLB model loaded and replaced fallback');
    }, (progress) => {
        console.log('Loading death star:', (progress.loaded / progress.total * 100) + '%');
    }, (error) => {
        console.log('⚠️ Death Star GLB not found, using fallback sphere');
    });

    window.addEventListener('resize', () => {
        const width = container.offsetWidth;
        const height = container.offsetHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);

        dsCamera.aspect = window.innerWidth / window.innerHeight;
        dsCamera.updateProjectionMatrix();
        dsRenderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function animate() {
    requestAnimationFrame(animate);
    if (pepperCan) pepperCan.rotation.y += 0.005;
    if (deathStar) deathStar.rotation.y += 0.005;
    
    // Always render both scenes
    renderer.render(scene, camera);
    if (dsRenderer && dsScene && dsCamera) {
        dsRenderer.render(dsScene, dsCamera);
    }
}

const trigger = document.getElementById('star-trigger');
const dsOverlay = document.getElementById('death-star-overlay');

if (trigger && dsOverlay) {
    console.log('✓ Star trigger found:', trigger);
    console.log('✓ Death star overlay found:', dsOverlay);
    
    // Desktop hover
    trigger.addEventListener('mouseenter', (e) => {
        console.log('🖱️ Star hover detected - showing overlay');
        dsOverlay.classList.add('visible');
        console.log('Overlay classes:', dsOverlay.className);
    });

    trigger.addEventListener('mouseleave', (e) => {
        console.log('🖱️ Star hover ended - hiding overlay');
        dsOverlay.classList.remove('visible');
    });

    // Mobile and desktop tap
    trigger.addEventListener('touchstart', (e) => {
        console.log('📱 Star touched (mobile) - toggling overlay');
        e.preventDefault();
        dsOverlay.classList.toggle('visible');
        console.log('Overlay visible:', dsOverlay.classList.contains('visible'));
    });
    
    trigger.addEventListener('click', (e) => {
        console.log('🖱️ Star clicked - toggling overlay');
        e.preventDefault();
        dsOverlay.classList.toggle('visible');
        console.log('Overlay visible:', dsOverlay.classList.contains('visible'));
    });
} else {
    console.error('❌ Elements not found:', {trigger, dsOverlay});
}

const snakeTrigger = document.getElementById('snake-trigger');
const snakeImg = document.getElementById('snake-img');
const container = document.querySelector('.container');

snakeTrigger.onclick = () => {
    snakeImg.classList.add('visible');
    
    // On mobile, add class to container to push content up
    if (window.innerWidth <= 768) {
        container.classList.add('flag-active');
    }
    
    setTimeout(() => { 
        snakeImg.classList.remove('visible');
        if (window.innerWidth <= 768) {
            container.classList.remove('flag-active');
        }
    }, 2000);
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
    setTimeout(() => { 
        banan.classList.remove('active'); 
        banan.style.opacity = '1'; 
        banan.style.transform = 'translateX(-50%)';
        idleTime = 0;
    }, 600);
};

init3D();
animate();
