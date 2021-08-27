import * as THREE from '../three.js-master/build/three.module.js'
import {GLTFLoader} from '../three.js-master/examples/jsm/loaders/GLTFLoader.js'
import {OrbitControls} from '../three.js-master/examples/jsm/controls/OrbitControls.js'
import Stats from '../three.js-master/examples/jsm/libs/stats.module.js'

var container, stats, controls, mixer, clock;
var camera, scene, renderer, canvas;

init();
animate();
onWindowResize();

function init() {
	// Create Scene
	container = document.createElement( 'div' );
	document.body.appendChild( container );
	
	// Set Camera
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.5, 500 );
	camera.position.set( 20, 60, 20 );
	// Set Scene
	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0x222222 );
	// scene.fog = new THREE.Fog( 0xa0a0a0, 200, 1000 ); // Fog
	
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

    // // Create Material
    // const geometry = new THREE.BoxGeometry(10, 10, 10)
    // const material = new THREE.MeshBasicMaterial({ color: 0x888866 })
    // const boxMesh = new THREE.Mesh(geometry, material)
    // scene.add(boxMesh)

    // https://jsfiddle.net/prisoner849/t2rm8awk/
    // Create Pie Chart
    const geometry1 = new THREE.CylinderGeometry( 50, 50, 10, 28, 1, false, 0, 1.2 * Math.PI );
    const material1 = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    const cylinder1 = new THREE.Mesh( geometry1, material1 );
    scene.add( cylinder1 );
    const geometry2 = new THREE.CylinderGeometry( 50, 50, 10, 28, 1, false, 1.2 * Math.PI, 0.5 * Math.PI );
    const material2 = new THREE.MeshBasicMaterial( {color: 0x00ffff} );
    const cylinder2 = new THREE.Mesh( geometry2, material2 );
    scene.add( cylinder2 );
    const geometry3 = new THREE.CylinderGeometry( 50, 50, 10, 28, 1, false, 1.7 * Math.PI, 0.3 * Math.PI );
    const material3 = new THREE.MeshBasicMaterial( {color: 0xff00ff} );
    const cylinder3 = new THREE.Mesh( geometry3, material3 );
    scene.add( cylinder3 );

	// Set Renderer
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setPixelRatio( Math.min(window.devicePixelRatio, 2) );
	renderer.gammaOutput = true;
	// renderer.setClearColor(0xffffff, 1)
	container.appendChild( renderer.domElement );

	// Create controler
	controls = new OrbitControls( camera, renderer.domElement );
	controls.enableZoom = true
	controls.enableDamping = true
	controls.target.set( 0, 0, 0 );
	controls.update();

	window.addEventListener( 'resize', onWindowResize, true );

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
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}
