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
        pepperCan.scale.set(1.2, 1.2, 1.2);
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
    dsCamera.position.set(0, 0, 1000);

    dsRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    dsRenderer.setSize(window.innerWidth, window.innerHeight);
    dsRenderer.setPixelRatio(window.devicePixelRatio);
    dsRenderer.setClearColor(0x000000, 1);
    
    if (dsContainer) {
        dsContainer.appendChild(dsRenderer.domElement);
    }

    dsScene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dsl = new THREE.DirectionalLight(0xffffff, 1.5);
    dsl.position.set(10, 10, 10);
    dsScene.add(dsl);
    
    const dsl2 = new THREE.DirectionalLight(0xaaaaff, 0.8);
    dsl2.position.set(-10, -5, 10);
    dsScene.add(dsl2);
    
    const dsl3 = new THREE.DirectionalLight(0xffffff, 0.5);
    dsl3.position.set(0, -10, -10);
    dsScene.add(dsl3);

    function createProceduralDeathStar() {
        const deathStarGroup = new THREE.Group();
        
        const mainSphere = new THREE.Mesh(
            new THREE.SphereGeometry(35, 64, 64),
            new THREE.MeshStandardMaterial({ 
                color: 0xaaaaaa, 
                metalness: 0.4, 
                roughness: 0.6,
                emissive: 0x333333
            })
        );
        deathStarGroup.add(mainSphere);
        
        const trenchGeometry = new THREE.TorusGeometry(35.8, 1.5, 16, 100);
        const trenchMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x666666,
            metalness: 0.6,
            roughness: 0.5
        });
        const trench = new THREE.Mesh(trenchGeometry, trenchMaterial);
        trench.rotation.x = Math.PI / 2;
        deathStarGroup.add(trench);
        
        const dishGeometry = new THREE.SphereGeometry(10, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
        const dishMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x777777,
            metalness: 0.7,
            roughness: 0.4,
            emissive: 0x00ff00,
            emissiveIntensity: 0.4
        });
        const dish = new THREE.Mesh(dishGeometry, dishMaterial);
        dish.rotation.x = Math.PI;
        dish.position.set(18, 18, 18);
        deathStarGroup.add(dish);
        
        for (let i = 0; i < 100; i++) {
            const panel = new THREE.Mesh(
                new THREE.BoxGeometry(2.5, 2.5, 0.4),
                new THREE.MeshStandardMaterial({ 
                    color: Math.random() > 0.5 ? 0x888888 : 0x777777,
                    metalness: 0.5,
                    roughness: 0.7
                })
            );
            
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const radius = 36;
            
            panel.position.x = radius * Math.sin(phi) * Math.cos(theta);
            panel.position.y = radius * Math.sin(phi) * Math.sin(theta);
            panel.position.z = radius * Math.cos(phi);
            
            panel.lookAt(0, 0, 0);
            deathStarGroup.add(panel);
        }
        
        return deathStarGroup;
    }

    loader.load('assets/death_star.glb', 
        (gltf) => {
            console.log('GLB Death Star загружена успешно!');
            deathStar = gltf.scene;
            const box = new THREE.Box3().setFromObject(deathStar);
            const center = box.getCenter(new THREE.Vector3());
            const size = new THREE.Vector3();
            box.getSize(size);
            deathStar.position.sub(center);
            deathStar.scale.set(10, 10, 10);
            dsScene.add(deathStar);
            console.log('GLB Death Star добавлена в сцену, размер:', size);
        },
        (progress) => {
            const percent = (progress.loaded / progress.total * 100).toFixed(0);
            console.log(`Death Star загрузка: ${percent}%`);
        },
        (error) => {
            console.error('Ошибка загрузки Death Star GLB:', error);
        }
    );

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
    
    renderer.render(scene, camera);
    if (dsRenderer && dsScene && dsCamera) {
        dsRenderer.render(dsScene, dsCamera);
    }
}

const trigger = document.getElementById('star-trigger');
const dsOverlay = document.getElementById('death-star-overlay');

if (trigger && dsOverlay) {
    let isTouch = false;

    trigger.addEventListener('touchstart', (e) => {
        isTouch = true;
        e.preventDefault();
        dsOverlay.classList.toggle('visible');
    }, { passive: false });

    trigger.addEventListener('mouseenter', () => {
        if (!isTouch) dsOverlay.classList.add('visible');
    });

    trigger.addEventListener('mouseleave', () => {
        if (!isTouch) dsOverlay.classList.remove('visible');
    });
    
    trigger.addEventListener('click', (e) => {
        if (isTouch) return;
        e.preventDefault();
        dsOverlay.classList.toggle('visible');
    });
}

const snakeTrigger = document.getElementById('snake-trigger');
const snakeImg = document.getElementById('snake-img');
const container = document.querySelector('.container');

snakeTrigger.onclick = () => {
    snakeImg.classList.add('visible');
    
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
