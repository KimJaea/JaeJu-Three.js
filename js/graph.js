import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/build/three.module.js';
import {OrbitControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/loaders/GLTFLoader.js';
import Stats from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/libs/stats.module.js'

var container, stats, controls, clock;
var camera, scene, renderer, geometry, text;
var ratioWidth = 1.0, ratioHeight = 0.9;

init();
animate();
onWindowResize();

function init() {
	// Create Scene
	container = document.createElement( 'div' );
	document.body.appendChild( container );
	// Set Camera
	camera = new THREE.PerspectiveCamera( 75, (window.innerWidth * ratioWidth) / (window.innerHeight * ratioHeight), 0.5, 1000 );
	camera.position.set( 0, 60, 100 );
	// Set Scene
	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0x89cc98 );
	
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
	controls.maxDistance = 500;
	controls.target.set( 0, 0, 0 );
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
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
}

function onWindowResize() {
	camera.aspect = (window.innerWidth * ratioWidth) / (window.innerHeight * ratioHeight );
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth * ratioWidth, window.innerHeight * ratioHeight );
}

function loadModel() {
	// GLTF Object with animation - Classroom
	var loader = new GLTFLoader().setPath('./assets/')
	loader.load('Classroom.glb', function(gltf) {
        var obj = gltf.scene;
		obj.position.set(0, 0, 0);
		obj.scale.set(20, 20, 20);
		obj.rotation.y = 90;
		scene.add( obj );
	})


	//loadChar();
	
	//loadText("우울증\n60%", new THREE.Vector3(-80, 20, -10));
	//loadText("감정조절이상\n15%", new THREE.Vector3(0, 20, 0));
	//loadText("FUCKYOU\n15%", new THREE.Vector3(30, 20, 30));
}

function loadChar() {
	const pie_radius = 60;
	const pie_height = 10;
	
	// Create Pie Chart
	const geometry1 = new THREE.CylinderGeometry( pie_radius, pie_radius, pie_height, 28, 1, false, 0, 1.2 * Math.PI );
	const material1 = new THREE.MeshBasicMaterial( {color: 0xffff00} );
	const cylinder1 = new THREE.Mesh( geometry1, material1 );
	scene.add( cylinder1 );
	const geometry2 = new THREE.CylinderGeometry( pie_radius, pie_radius, pie_height, 28, 1, false, 1.2 * Math.PI, 0.5 * Math.PI );
	const material2 = new THREE.MeshBasicMaterial( {color: 0x00ffff} );
	const cylinder2 = new THREE.Mesh( geometry2, material2 );
	scene.add( cylinder2 );
	const geometry3 = new THREE.CylinderGeometry( pie_radius, pie_radius, pie_height, 28, 1, false, 1.7 * Math.PI, 0.3 * Math.PI );
	const material3 = new THREE.MeshBasicMaterial( {color: 0xff00ff} );
	const cylinder3 = new THREE.Mesh( geometry3, material3 );
	scene.add( cylinder3 );
}

function loadText(string_name, string_loc) {
	if(text) {
		text.parent.remove(text)
	}

	// Create Text Geometry
	const loader = new THREE.FontLoader();
	loader.load( '../assets/Do_Hyeon/Do_Hyeon_Regular.json', function(font) {
		geometry = new THREE.TextGeometry(string_name, {
			font: font,
			size: 10,
			height: 2,
		})
		text = new THREE.Mesh(geometry, [
			new THREE.MeshPhongMaterial({ color: 0xad4000 }), //font
			new THREE.MeshPhongMaterial({ color: 0x5c2301 }) //side
		])
		text.castShadow = true
		text.position.set(string_loc.x, string_loc.y, string_loc.z)
		text.rotateX(50)
		scene.add(text)
	})
}
