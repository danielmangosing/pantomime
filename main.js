// Basic Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('c'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Load the model
const loader = new THREE.GLTFLoader();
let model;
loader.load('jester.gltf', (gltf) => {
    model = gltf.scene;
    scene.add(model);
});

// Camera position
camera.position.z = 5;

// Floating effect variables
let floatDirection = 1;
let floatSpeed = 0.005;

// Mouse move event to orient the model
document.addEventListener('mousemove', (event) => {
    const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    const mouseY = - (event.clientY / window.innerHeight) * 2 + 1;
    
    if (model) {
        model.rotation.y = mouseX;
        model.rotation.x = mouseY;
    }
});

// Resize event
window.addEventListener('resize', () => {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
});

// Animation
function animate() {
    requestAnimationFrame(animate);

    // Floating effect
    model.position.y += floatDirection * floatSpeed;
    if (model.position.y > 0.1 || model.position.y < -0.1) {
        floatDirection *= -1;
    }

    renderer.render(scene, camera);
}

animate();