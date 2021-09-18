import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/build/three.module.js';
import {OrbitControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/loaders/GLTFLoader.js';
import Stats from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/libs/stats.module.js'

var container, stats, controls, mixer, clock;
var camera, scene, renderer;
var ratioWidth = 0.5, ratioHeight = 0.9;

init();
animate();
onWindowResize();

function init() {
	// Create Scene
	container = document.createElement( 'div' );
	document.body.appendChild( container );
	// Set Camera
	camera = new THREE.PerspectiveCamera( 75, (window.innerWidth * ratioWidth) / (window.innerHeight * ratioHeight), 0.5, 1000 );
	camera.position.set( 0, 10, 15 );
	// Set Scene
	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0x3ed3ed );
	
	clock = new THREE.Clock();

	// Light From Camera
	const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
	hemiLight.position.set( 0, 200, 0 );
	scene.add( hemiLight );
	// Light of Sun
	const dirLight = new THREE.DirectionalLight( 0xffffff );
	dirLight.position.set( 0, 200, 100 );
	dirLight.castShadow = true;
	dirLight.shadow.camera.top = 180;
	dirLight.shadow.camera.bottom = - 100;
	dirLight.shadow.camera.left = - 120;
	dirLight.shadow.camera.right = 120;
	scene.add( dirLight );

	// Load Models
	loadModel();

	// Set Renderer
	renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
	renderer.setSize( window.innerWidth * ratioWidth, window.innerHeight * ratioHeight );
	renderer.setPixelRatio( Math.min(window.devicePixelRatio, 2) );
	renderer.gammaOutput = true;
	container.appendChild( renderer.domElement );

	// Event Listener
	window.addEventListener( 'resize', onWindowResize, true );

	// Create controler
	controls = new OrbitControls( camera, renderer.domElement );
	controls.enableZoom = true
	controls.enableDamping = true
	controls.minDistance = 10;
	controls.maxDistance = 100;
	controls.target.set( 0, 10, 0 );
	controls.update();

	// Stats
	stats = new Stats();
	container.appendChild( stats.dom );

	// Make mouse control smooth
	const tick = ()=>{
		renderer.render(scene, camera)
		window.requestAnimationFrame(tick)
		controls.update()
	}
	tick()
}

function animate() {
    requestAnimationFrame(animate);
	var delta = clock.getDelta();
	if ( mixer ) mixer.update( delta );
    renderer.render(scene, camera);
	stats.update();
}

function onWindowResize() {
    camera.aspect = (window.innerWidth * ratioWidth) / (window.innerHeight * ratioHeight );
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth * ratioWidth, window.innerHeight * ratioHeight );
}

function loadModel() {
	// GLTF Object with animation - Dance
    var loader = new GLTFLoader().setPath('./assets/')
	loader.load('Dance.glb', function(gltf) {
        gltf.scene.scale.setScalar(0.1);
		gltf.scene.position.set(0, 0, 0);
		scene.add( gltf.scene );

        mixer = new THREE.AnimationMixer( gltf.scene );	
		var action = mixer.clipAction( gltf.animations[ 0 ] ); // Dance
        action.play();
    })
}
