import * as THREE from './assets/js/three.js';
import { PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { GLTFLoader } from './assets/js/lib/loaders/GLTFLoader.js';

const threejsCanvas = document.querySelector('#threejs-canvas');
let width = threejsCanvas.offsetWidth;
let height = threejsCanvas.offsetHeight;

// Basic Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, width / height, 1, 1000);

const renderer = new THREE.WebGLRenderer({ 
    antialias: true, 
});

renderer.setSize(width, height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
threejsCanvas.appendChild(renderer.domElement);

// Load the model
const loader = new GLTFLoader();
let model;
loader.load('models/Jester.gltf', (gltf) => {
    //model = gltf.scene;
    //model.position.set(0,0,0);
    scene.add(model);
});

// Camera position
camera.position.z = 10;
camera.lookAt(0,0,0);


function render(){

model.rotation.z += 0.05;

    renderer.render(scene,camera);
    window.requestAnimationFrame(update);
}

render();

// Resize event
window.addEventListener('resize', () => {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
    render();
});