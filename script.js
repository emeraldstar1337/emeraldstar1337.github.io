const trigger = document.getElementById('star-trigger');
const starDialog = document.getElementById('death-star-overlay');
const closeButton = starDialog.querySelector('.close-button');
const pepperCard = document.querySelector('.pepper-card');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const views = [];
let pinned = false;
let suppressHover = false;
let ownsHistoryEntry = false;
let threePromise;
let frame = 0;
let lastFrame = 0;

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        const timeout = setTimeout(() => reject(new Error('Script loading timed out')), 20000);
        script.src = src;
        script.async = true;
        script.onload = () => {
            clearTimeout(timeout);
            resolve();
        };
        script.onerror = () => {
            clearTimeout(timeout);
            reject(new Error('Script loading failed'));
        };
        document.head.append(script);
    });
}

function getThree() {
    if (!threePromise) {
        threePromise = (async () => {
            if (!window.THREE) await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js');
            if (!window.THREE.GLTFLoader) await loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js');
            return window.THREE;
        })().catch(() => null);
    }
    return threePromise;
}

class ModelView {
    constructor(element, host, path, isStar = false) {
        this.element = element;
        this.host = host;
        this.path = path;
        this.isStar = isStar;
        this.visible = false;
        views.push(this);
        this.observer = new ResizeObserver(() => this.resize());
        this.observer.observe(element);
    }

    get active() {
        return this.visible && this.model && !document.hidden && (this.isStar || !starDialog.open);
    }

    async init() {
        if (this.initializing) return;
        this.initializing = true;
        const T = await getThree();
        if (!T) return;
        this.T = T;
        try {
            this.renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
        } catch {
            return;
        }
        this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
        this.renderer.outputEncoding = T.sRGBEncoding;
        this.scene = new T.Scene();
        this.camera = new T.PerspectiveCamera(this.isStar ? 40 : 35, 1, .1, 100);
        this.camera.position.set(0, 0, this.isStar ? 8.5 : 6.4);
        this.scene.add(new T.AmbientLight(0xffffff, this.isStar ? 1.1 : 1.7));
        const key = new T.DirectionalLight(0xffffff, this.isStar ? 2 : 2.2);
        key.position.set(-3, 4, 6);
        this.scene.add(key);
        const fill = new T.DirectionalLight(this.isStar ? 0xb3cbbb : 0xe0f7da, .8);
        fill.position.set(4, 0, -2);
        this.scene.add(fill);
        this.element.append(this.renderer.domElement);
        this.renderer.domElement.addEventListener('webglcontextlost', event => {
            event.preventDefault();
            this.lost = true;
            this.host.classList.remove('model-ready');
            refreshRendering();
        });
        this.renderer.domElement.addEventListener('webglcontextrestored', () => {
            this.lost = false;
            this.host.classList.add('model-ready');
            this.resize();
        });
        this.resize();
        const object = await new Promise(resolve => {
            new T.GLTFLoader().load(this.path, gltf => resolve(gltf.scene), undefined, () => resolve(this.fallback()));
        });
        object.updateMatrixWorld(true);
        let framingTarget = object;
        if (this.isStar) {
            object.traverse(node => {
                if (node.isMesh && /main.?hull/i.test(node.name)) framingTarget = node;
            });
        }
        const box = new T.Box3().setFromObject(framingTarget);
        const center = box.getCenter(new T.Vector3());
        const size = box.getSize(new T.Vector3());
        object.position.sub(center);
        const pivot = new T.Group();
        pivot.add(object);
        pivot.scale.setScalar((this.isStar ? 4.8 : 2.7) / Math.max(size.x, size.y, size.z, .001));
        pivot.rotation.set(this.isStar ? .08 : -.07, this.isStar ? .3 : -.35, this.isStar ? 0 : -.15);
        this.model = pivot;
        this.scene.add(pivot);
        this.host.classList.add('model-ready');
        this.resize();
        refreshRendering();
    }

    fallback() {
        const T = this.T;
        if (!this.isStar) {
            return new T.Mesh(
                new T.CylinderGeometry(.8, .8, 2.5, 32),
                new T.MeshStandardMaterial({ color: 0x871f3b, metalness: .55, roughness: .3 })
            );
        }
        const group = new T.Group();
        group.add(new T.Mesh(
            new T.SphereGeometry(2, 48, 32),
            new T.MeshStandardMaterial({ color: 0x88938d, metalness: .35, roughness: .65 })
        ));
        const trench = new T.Mesh(
            new T.TorusGeometry(2.01, .035, 8, 64),
            new T.MeshStandardMaterial({ color: 0x303d33 })
        );
        trench.rotation.x = Math.PI / 2;
        group.add(trench);
        const dish = new T.Mesh(
            new T.SphereGeometry(.48, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
            new T.MeshStandardMaterial({ color: 0x506457, metalness: .5, roughness: .5 })
        );
        dish.position.set(-.7, .7, 1.63);
        dish.rotation.x = Math.PI / 2;
        group.add(dish);
        return group;
    }

    resize() {
        if (!this.renderer || this.lost) return;
        const width = this.element.clientWidth;
        const height = this.element.clientHeight;
        if (!width || !height) return;
        this.camera.aspect = width / height;
        if (this.isStar) {
            const halfFov = this.camera.fov * Math.PI / 360;
            this.camera.position.z = 2.4 / (Math.tan(halfFov) * Math.min(this.camera.aspect, 1) * .72);
        }
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height, false);
        if (this.active) this.draw(0);
    }

    setVisible(value) {
        this.visible = value;
        if (value) {
            this.init();
            this.resize();
        }
        refreshRendering();
    }

    draw(delta) {
        if (!this.active || this.lost) return;
        if (!reducedMotion.matches) this.model.rotation.y += delta * .24;
        this.renderer.render(this.scene, this.camera);
    }
}

const pepperView = new ModelView(document.getElementById('pepper-canvas-container'), pepperCard, 'assets/dr_pepper_can.glb');
const starView = new ModelView(document.getElementById('death-star-canvas-container'), starDialog, 'assets/death_star.glb', true);

function refreshRendering() {
    cancelAnimationFrame(frame);
    frame = 0;
    lastFrame = 0;
    if (document.hidden) return;
    views.forEach(view => view.draw(0));
    if (!reducedMotion.matches && views.some(view => view.active && !view.lost)) {
        frame = requestAnimationFrame(renderFrame);
    }
}

function renderFrame(time) {
    frame = 0;
    if (document.hidden || reducedMotion.matches || !views.some(view => view.active && !view.lost)) return;
    if (time - lastFrame >= 1000 / 30) {
        const delta = lastFrame ? Math.min((time - lastFrame) / 1000, .08) : 0;
        views.forEach(view => view.draw(delta));
        lastFrame = time;
    }
    frame = requestAnimationFrame(renderFrame);
}

const visibilityObserver = new IntersectionObserver(entries => {
    pepperView.setVisible(entries[0].isIntersecting);
});
visibilityObserver.observe(pepperCard);

function openStar(pin = false) {
    if (pin && pinned) return;
    if (pin) {
        if (starDialog.open) starDialog.close();
        starDialog.removeAttribute('data-preview');
        pinned = true;
        document.body.classList.add('overlay-open');
        starDialog.showModal();
        closeButton.focus({ preventScroll: true });
        if (!history.state?.emeraldDeathStar) {
            history.pushState({ ...history.state, emeraldDeathStar: true }, '');
            ownsHistoryEntry = true;
        }
    } else {
        if (starDialog.open || pinned || suppressHover) return;
        const focused = document.activeElement;
        starDialog.setAttribute('data-preview', '');
        starDialog.show();
        focused?.focus({ preventScroll: true });
    }
    trigger.setAttribute('aria-expanded', 'true');
    starView.setVisible(true);
}

function closeStar(fromHistory = false) {
    const wasPinned = pinned;
    pinned = false;
    if (starDialog.open) starDialog.close();
    starDialog.removeAttribute('data-preview');
    trigger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('overlay-open');
    starView.setVisible(false);
    if (wasPinned) {
        suppressHover = true;
        trigger.focus({ preventScroll: true });
    }
    if (ownsHistoryEntry && history.state?.emeraldDeathStar && !fromHistory) history.back();
    ownsHistoryEntry = false;
}

trigger.addEventListener('pointerenter', event => {
    if (event.pointerType === 'mouse' && finePointer.matches) openStar();
});
trigger.addEventListener('pointerleave', () => {
    suppressHover = false;
    if (!pinned) closeStar();
});
trigger.addEventListener('click', () => pinned ? closeStar() : openStar(true));
starDialog.addEventListener('click', () => {
    if (pinned) closeStar();
});
starDialog.addEventListener('cancel', event => {
    event.preventDefault();
    closeStar();
});
starDialog.addEventListener('close', () => {
    if (!starDialog.open && pinned) closeStar();
});
document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && starDialog.open) {
        event.preventDefault();
        closeStar();
    }
});
window.addEventListener('popstate', () => {
    if (starDialog.open) closeStar(true);
    ownsHistoryEntry = false;
});

const snakeTrigger = document.getElementById('snake-trigger');
const snakeImg = document.getElementById('snake-img');
let snakeTimeout;

function hideFlag() {
    snakeImg.classList.remove('visible');
    snakeImg.setAttribute('aria-hidden', 'true');
    snakeTrigger.setAttribute('aria-expanded', 'false');
}

snakeTrigger.addEventListener('click', () => {
    snakeImg.classList.add('visible');
    snakeImg.setAttribute('aria-hidden', 'false');
    snakeTrigger.setAttribute('aria-expanded', 'true');
    clearTimeout(snakeTimeout);
    snakeTimeout = setTimeout(hideFlag, 2000);
});

const banan = document.getElementById('john-banan');
let idleTimeout;
let dismissTimeout;

function resetIdle() {
    clearTimeout(idleTimeout);
    if (document.hidden || starDialog.open || banan.classList.contains('active')) return;
    idleTimeout = setTimeout(() => {
        if (document.hidden || starDialog.open) return;
        banan.classList.add('active');
        banan.tabIndex = 0;
        banan.setAttribute('aria-hidden', 'false');
    }, 16000);
}

for (const event of ['pointermove', 'pointerdown', 'keydown', 'scroll']) {
    document.addEventListener(event, resetIdle, { passive: true });
}
banan.addEventListener('click', () => {
    banan.classList.remove('active');
    banan.tabIndex = -1;
    banan.setAttribute('aria-hidden', 'true');
    clearTimeout(dismissTimeout);
    dismissTimeout = setTimeout(resetIdle, 600);
});
document.addEventListener('visibilitychange', () => {
    document.documentElement.toggleAttribute('data-paused', document.hidden);
    refreshRendering();
    resetIdle();
});
reducedMotion.addEventListener('change', refreshRendering);
window.addEventListener('pageshow', () => {
    if (starDialog.open) closeStar();
    resetIdle();
});
resetIdle();
