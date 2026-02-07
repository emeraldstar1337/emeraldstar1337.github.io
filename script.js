let scene,camera,renderer,pepper;
let dsScene,dsCamera,dsRenderer,deathStar;

function initPepper(){
    const c=document.getElementById('pepper-canvas-container');
    scene=new THREE.Scene();
    camera=new THREE.PerspectiveCamera(35,c.clientWidth/c.clientHeight,.1,100);
    camera.position.z=8;
    renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});
    renderer.setSize(c.clientWidth,c.clientHeight);
    c.appendChild(renderer.domElement);
    scene.add(new THREE.AmbientLight(0xffffff,1.2));
    const g=new THREE.CylinderGeometry(1,1,2.5,32);
    const m=new THREE.MeshStandardMaterial({color:0x7a0000,metalness:.8,roughness:.3});
    pepper=new THREE.Mesh(g,m);
    scene.add(pepper);
}

function initDeathStar(){
    const overlay=document.getElementById('death-star-overlay');
    dsScene=new THREE.Scene();
    dsCamera=new THREE.PerspectiveCamera(40,innerWidth/innerHeight,.1,1000);
    dsCamera.position.z=30;
    dsRenderer=new THREE.WebGLRenderer({alpha:true,antialias:true});
    dsRenderer.setSize(innerWidth,innerHeight);
    overlay.appendChild(dsRenderer.domElement);
    dsScene.add(new THREE.AmbientLight(0xffffff,1.2));
    const d1=new THREE.DirectionalLight(0xffffff,1.4);
    d1.position.set(5,5,5);
    dsScene.add(d1);

    const loader=new THREE.GLTFLoader();
    loader.load('assets/death_star.glb',g=>{
        deathStar=g.scene;
        const b=new THREE.Box3().setFromObject(deathStar);
        const c=b.getCenter(new THREE.Vector3());
        deathStar.position.sub(c);
        deathStar.scale.set(4,4,4);
        dsScene.add(deathStar);
    },undefined,()=>{
        deathStar=new THREE.Mesh(
            new THREE.SphereGeometry(4,64,64),
            new THREE.MeshStandardMaterial({color:0x555555,metalness:.6,roughness:.4})
        );
        dsScene.add(deathStar);
    });
}

function animate(){
    requestAnimationFrame(animate);
    pepper.rotation.y+=.005;
    renderer.render(scene,camera);
    if(deathStar && overlay.classList.contains('visible')){
        deathStar.rotation.y+=.004;
        dsRenderer.render(dsScene,dsCamera);
    }
}

const trigger=document.getElementById('star-trigger');
const overlay=document.getElementById('death-star-overlay');
let touched=false;

trigger.addEventListener('touchstart',e=>{
    touched=true;
    e.preventDefault();
    overlay.classList.toggle('visible');
},{passive:false});

trigger.addEventListener('mouseenter',()=>{ if(!touched) overlay.classList.add('visible'); });
trigger.addEventListener('mouseleave',()=>{ if(!touched) overlay.classList.remove('visible'); });

const snake=document.getElementById('snake-trigger');
const flag=document.getElementById('snake-img');
const container=document.querySelector('.container');

snake.onclick=()=>{
    flag.classList.add('visible');
    container.classList.add('flag-active');
    setTimeout(()=>{
        flag.classList.remove('visible');
        container.classList.remove('flag-active');
    },2000);
};

let idle=0;
const banan=document.getElementById('john-banan');
document.addEventListener('mousemove',()=>idle=0);
setInterval(()=>{
    idle++;
    if(idle>15) banan.classList.add('active');
},1000);

banan.onclick=()=>{
    banan.classList.remove('active');
    idle=0;
};

initPepper();
initDeathStar();
animate();
