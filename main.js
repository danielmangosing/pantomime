import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { RenderPixelatedPass } from 'three/addons/postprocessing/RenderPixelatedPass.js';
import { AfterimagePass } from 'three/addons/postprocessing/AfterimagePass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';


let modelXPos;
let modelZPos;

function isMobile() {
    return window.innerWidth <= 768;
}

if (isMobile()) {
    // Code to run on mobile devices
    console.log("Running on a mobile device");
    modelXPos = 0.0;
    modelZPos = -5.0;
} else {
    // Code to run on desktop or other devices
    console.log("Running on a desktop or other device");
    modelXPos = 1.3;
    modelZPos = 0.5;
}

const threejsCanvas = document.querySelector('#threejs-canvas');
let width = threejsCanvas.offsetWidth;
let height = threejsCanvas.offsetHeight;
let composer;


// Basic Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(38, width / height, 1, 1000);

scene.background = new THREE.Color('white' );


const renderer = new THREE.WebGLRenderer({ 
    antialias: false,
});

renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;

renderer.setSize(width, height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
threejsCanvas.appendChild(renderer.domElement);




const DitherShader = {

	name: 'DitherShader',

	uniforms: {

		'tDiffuse': { value: null },
		'opacity': { value: 1.0 },
        'viewport_size': {value: new THREE.Vector2(window.innerWidth, window.innerHeight)}

	},

	vertexShader: /* glsl */`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

	fragmentShader: /* glsl */`

		uniform float opacity;

		uniform sampler2D tDiffuse;
        uniform vec2 viewport_size;

		varying vec2 vUv;

        const mat4 bayertl = mat4( 
            0.0/64.0, 32.0/64.0,  8.0/64.0, 40.0/64.0,
           48.0/64.0, 16.0/64.0, 56.0/64.0, 24.0/64.0,
           12.0/64.0, 44.0/64.0,  4.0/64.0, 36.0/64.0,
           60.0/64.0, 28.0/64.0, 52.0/64.0, 20.0/64.0
           );
           
           const mat4 bayertr = mat4( 
            2.0/64.0, 34.0/64.0, 10.0/64.0, 42.0/64.0,
           50.0/64.0, 18.0/64.0, 58.0/64.0, 26.0/64.0,
           14.0/64.0, 46.0/64.0,  6.0/64.0, 38.0/64.0,
           62.0/64.0, 30.0/64.0, 54.0/64.0, 22.0/64.0
           );
           
           const mat4 bayerbl = mat4( 
            3.0/64.0, 35.0/64.0, 11.0/64.0, 43.0/64.0,
           51.0/64.0, 19.0/64.0, 59.0/64.0, 27.0/64.0,
           15.0/64.0, 47.0/64.0,  7.0/64.0, 39.0/64.0,
           63.0/64.0, 31.0/64.0, 55.0/64.0, 23.0/64.0
           );
               
           const mat4 bayerbr = mat4( 
            1.0/64.0, 33.0/64.0,  9.0/64.0, 41.0/64.0,
           49.0/64.0, 17.0/64.0, 57.0/64.0, 25.0/64.0,
           13.0/64.0, 45.0/64.0,  5.0/64.0, 37.0/64.0,
           61.0/64.0, 29.0/64.0, 53.0/64.0, 21.0/64.0
           );
           
           float dither( mat4 m, ivec2 p )
           {
               if( p.y == 0 ) 
               {
                   if( p.x == 0 ) return m[0][0];
                   else if( p.x == 1 ) return m[1][0];
                   else if( p.x == 2 ) return m[2][0];
                   else return m[3][0];	
               }	
               else if( p.y == 1 ) 
               {
                   if( p.x == 0 ) return m[0][1];
                   else if( p.x == 1 ) return m[1][1];
                   else if( p.x == 2 ) return m[2][1];
                   else return m[3][1];	
               }	
               else if( p.y == 2 ) 
               {
                   if( p.x == 0 ) return m[0][1];
                   else if( p.x == 1 ) return m[1][2];
                   else if( p.x == 2 ) return m[2][2];
                   else return m[3][2];	
               }	
               else 
               {
                   if( p.x == 0 ) return m[0][3];
                   else if( p.x == 1 ) return m[1][3];
                   else if( p.x == 2 ) return m[2][3];
                   else return m[3][3];	
               }	
           }
           

		void main() {
            
            vec2 uv = vUv;
            vec2 fragCoord = vUv * viewport_size;

            ivec2 p = ivec2(mod( fragCoord.xy, 8.0 ));
	        vec3 c = texture2D( tDiffuse, uv ).xyz;
	        c = pow( c, vec3(2.2) );	
	        c -= 1.0/255.0;

            vec3 d = vec3(0.0);
	if( p.x <= 3 && p.y <= 3 )
	{
		d.r = float( c.r > dither( bayertl, p ) );
		d.g = float( c.g > dither( bayertl, p ) );
		d.b = float( c.b > dither( bayertl, p ) );
	}
	else if ( p.x > 3 && p.y <= 3 )
	{
		d.r = float( c.r > dither( bayertr, p -ivec2(4,0) ) );
		d.g = float( c.g > dither( bayertr, p -ivec2(4,0) ) );
		d.b = float( c.b > dither( bayertr, p -ivec2(4,0) ) );
	}
	else if( p.x <= 3 && p.y > 3 )
	{
		d.r = float( c.r > dither( bayerbl, p-ivec2(0,4)  ) );
		d.g = float( c.g > dither( bayerbl, p-ivec2(0,4)  ) );
		d.b = float( c.b > dither( bayerbl, p-ivec2(0,4)  ) );
	}
	else if ( p.x > 3 && p.y > 3 )
	{
		d.r = float( c.r > dither( bayerbr, p -ivec2(4,4) ) );
		d.g = float( c.g > dither( bayerbr, p -ivec2(4,4) ) );
		d.b = float( c.b > dither( bayerbr, p -ivec2(4,4) ) );
	}

            

            vec4 out_color = vec4(d,1.0);

			gl_FragColor = out_color;
		}`

};

const renderScene = new RenderPass( scene, camera );


const renderPixelatedPass = new RenderPixelatedPass( 6, scene, camera );

const ditherPass = new ShaderPass( DitherShader );
const afterImagePass = new AfterimagePass();
afterImagePass.uniforms['damp'].value = 0.8;
const bokehPass = new BokehPass(scene, camera, 
    {focus: 2.25,
	aperture: 0.02,
	maxblur: 2.0
    });



const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
	bloomPass.threshold = 0.5;
	bloomPass.strength = 0.15;
	bloomPass.radius = 0;

const outputPass = new OutputPass();

	composer = new EffectComposer( renderer );
	composer.addPass( renderScene );
    composer.addPass( renderPixelatedPass );
    composer.addPass( ditherPass );
    
    composer.addPass(afterImagePass);
    composer.addPass(bokehPass);
    composer.addPass( bloomPass );
	composer.addPass( outputPass );


const domeLight = new THREE.HemisphereLight(
        'white',
        'white',
        0.5,
    )
scene.add (domeLight);
    
const pointLight = new THREE.PointLight(
        0xff0000, 75, 100
    );
pointLight.position.set(
        -2,
        3,
        -3
        );
scene.add(pointLight);






let model;
// Load the model
const loader = new GLTFLoader();
loader.load('/Jester3.gltf', (gltf) => {
    
    model = gltf.scene;
    model.position.set(modelXPos,-0.6,modelZPos);
    model.rotation.z = 0.05;
    scene.add(model);

    model.traverse((node) =>{
        if (node.isMesh) {
            const material = node.material;
            //console.log('Material Type:', material.type);


            if (Array.isArray(material)){
                material.forEach((mat) =>{
                   
                });
            } else {
                //material.flatShading = true;
                material.roughness = 0.75;
                material.metalness = 0.5;
                material.needsUpdate = true;
            }
        }
    });
    
});

new RGBELoader().load('/studio_small_09_1k.hdr', function (texture){
    texture.mapping = THREE.EquirectangularReflectionMapping;

    //scene.background = texture;
    scene.environment = texture;
});

// Camera position
camera.position.z = 3;
camera.lookAt(0,0,0);

function renderOnce(){
    if (model){
        model.rotation.y += 0.005;
            }

 composer.render();
            
}



function render(){

    renderOnce();
    

    requestAnimationFrame(render);
    

   
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
    renderOnce();
});