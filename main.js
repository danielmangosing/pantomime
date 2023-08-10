import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { RenderPixelatedPass } from 'three/addons/postprocessing/RenderPixelatedPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const threejsCanvas = document.querySelector('#threejs-canvas');
let width = threejsCanvas.offsetWidth;
let height = threejsCanvas.offsetHeight;
let composer;


// Basic Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, width / height, 1, 1000);

scene.background = new THREE.Color('white' );

const domeLight = new THREE.HemisphereLight(
    'white',
    'black',
    2,
)
scene.add (domeLight);

const pointLight = new THREE.PointLight(
    0xff0000, 75, 100
);
pointLight.position.set(-2,3,-3);
scene.add(pointLight);


const renderer = new THREE.WebGLRenderer({ 
    antialias: false,
});

renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;

renderer.setSize(width, height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
threejsCanvas.appendChild(renderer.domElement);

const renderScene = new RenderPass( scene, camera );


const renderPixelatedPass = new RenderPixelatedPass( 6, scene, camera );
			


const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
	bloomPass.threshold = 0;
	bloomPass.strength = 0.35;
	bloomPass.radius = 0;

const outputPass = new OutputPass();

	composer = new EffectComposer( renderer );
	composer.addPass( renderScene );
    composer.addPass( renderPixelatedPass );
	composer.addPass( bloomPass );
    //composer.addPass( ditherPass );
	composer.addPass( outputPass );



let model;
// Load the model
const loader = new GLTFLoader();
loader.load('public/Jester.gltf', (gltf) => {
    
    model = gltf.scene;
    model.position.set(1.5,-0.6,0);
    model.rotation.z = 0.05;
    scene.add(model);

    const clownModel = model.getObject
    //scene.add(gltf.scene);


});

// Camera position
camera.position.z = 3;
camera.lookAt(0,0,0);


function render(){

    if (model){
model.rotation.y += 0.005;
    }

    requestAnimationFrame(render);
    composer.render();

   
    //renderer.render(scene,camera);
    
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