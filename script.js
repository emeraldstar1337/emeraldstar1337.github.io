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
    light.position.set(5,5,5);
    scene.add(light);

    const loader = new THREE.GLTFLoader();

    loader.load('assets/dr_pepper_can.glb', gltf => {
        pepperCan = gltf.scene;
        pepperCan.scale.set(1.8,1.8,1.8);
        scene.add(pepperCan);
    });

    const dsContainer = document.getElementById('death-star-overlay');

    dsScene = new THREE.Scene();
    dsCamera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
    dsCamera.position.set(0,0,20);

    dsRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    dsRenderer.setSize(window.innerWidth, window.innerHeight);
    dsRenderer.setPixelRatio(window.devicePixelRatio);
    dsContainer.appendChild(dsRenderer.domElement);

    dsScene.add(new THREE.AmbientLight(0xffffff, 1.4));
    const d1 = new THREE.DirectionalLight(0xffffff, 1.2);
    d1.position.set(5,5,5);
    dsScene.add(d1);

    loader.load('assets/death_star.glb', gltf => {
        deathStar = gltf.scene;
        deathStar.scale.set(4,4,4);
        dsScene.add(deathStar);
    });
}

function animate() {
    requestAnimationFrame(animate);
    if (pepperCan) pepperCan.rotation.y += 0.005;
    if (deathStar) deathStar.rotation.y += 0.003;
    renderer.render(scene, camera);
    dsRenderer.render(dsScene, dsCamera);
}

const trigger = document.getElementById('star-trigger');
const dsOverlay = document.getElementById('death-star-overlay');

trigger.addEventListener('mouseenter', () => dsOverlay.classList.add('visible'));
trigger.addEventListener('mouseleave', () => dsOverlay.classList.remove('visible'));
trigger.addEventListener('touchstart', e => {
    e.preventDefault();
    dsOverlay.classList.toggle('visible');
},{passive:false});

const snakeTrigger = document.getElementById('snake-trigger');
const snakeImg = document.getElementById('snake-img');
const container = document.querySelector('.container');

snakeTrigger.onclick = () => {
    snakeImg.classList.add('visible');
    if (window.innerWidth <= 768) container.classList.add('flag-active');
    setTimeout(()=>{
        snakeImg.classList.remove('visible');
        container.classList.remove('flag-active');
    },2000);
};

let idleTime = 0;
const banan = document.getElementById('john-banan');

document.addEventListener('mousemove',()=>idleTime=0);
setInterval(()=>{
    idleTime++;
    if(idleTime>15) banan.classList.add('active');
},1000);

banan.onclick = () => {
    banan.classList.remove('active');
    idleTime = 0;
};

init3D();
animate();
