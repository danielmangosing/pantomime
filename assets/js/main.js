import * as THREE from 'three';
import { PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { GLTFLoader } from '../assets/js/lib/loaders/GLTFLoader.js';

// Basic Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('c'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Load the model
const loader = new GLTFLoader();
let model;
loader.load('models/Jester.gltf', (gltf) => {
    //model = gltf.scene;
    //model.position.set(0,0,0);
    scene.add(model);
});

// Camera position
camera.position.z = 5;


function render(){
    renderer.render(scene,camera);
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