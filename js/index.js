import * as THREE from '../three.js-master/build/three.module.js'
import {GLTFLoader} from '../three.js-master/examples/jsm/loaders/GLTFLoader.js'
import {OrbitControls} from '../three.js-master/examples/jsm/controls/OrbitControls.js'
import Stats from '../three.js-master/examples/jsm/libs/stats.module.js'

var container, stats, controls, mixer, clock;
var camera, scene, renderer;

var moveForward = false, moveBackward = false, turnLeft = false, turnRight = false;
var model, lastAction, activeAction;

var mouse = new THREE.Vector2(), raycaster = new THREE.Raycaster(), objects = [];

init();
animate();
onWindowResize();

function init() {
	// Create Scene
	container = document.createElement( 'div' );
	document.body.appendChild( container );
	
	// Set Camera
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.5, 500 );
	camera.position.set( -30, 20, -30 );
	// Set Scene
	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0x6dddff );
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

	// Load Models
	loadModel();

	// Set Renderer
	renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setPixelRatio( Math.min(window.devicePixelRatio, 2) );
	renderer.gammaOutput = true;
	// renderer.setClearColor(0xffffff, 1)
	container.appendChild( renderer.domElement );

	// Create controler
	controls = new OrbitControls( camera, renderer.domElement );
	controls.enableZoom = true
	controls.enableDamping = true
	controls.minDistance = 10;
	controls.maxDistance = 40;
	controls.target.set( -48, 5, -48 );
	controls.update();

	window.addEventListener( 'resize', onWindowResize, true );
	document.addEventListener( 'mousedown', onDocumentMouseDown, false );

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

	const btn1 = document.querySelector('#button1');
	btn1.addEventListener('click', () => {
		camera.position.set(-30, 50, -60);
	})
	const btn2 = document.querySelector('#button2');
	btn2.addEventListener('click', () => {
		camera.position.set(-60, 50, -60);
	})
	const btn3 = document.querySelector('#button3');
	btn3.addEventListener('click', () => {
		camera.position.set(-60, 50, -30);
	})
	const btn4 = document.querySelector('#button4');
	btn4.addEventListener('click', () => {
		camera.position.set(-30, 50, -30);
		window.open("http://127.0.0.1:5500/graph.html", "page")
	})

	// // Set Buttons
	// var info = document.createElement('div');
	// info.innerHTML ='<div id="menu"> Buttons <div id="button1"> BTN1 </div> <div id="button2"> BTN2 </div> <div id="button3"> BTN3 </div> <div id="button4"> BTN4 </div> </div>';
	// container.appendChild(info);
}

function animate() {
	requestAnimationFrame( animate );
	var delta = clock.getDelta();
	if ( mixer ) mixer.update( delta );
	if ( model ) moveModel(); // KeyDown & KeyUp
	renderer.render( scene, camera );
	stats.update();
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function loadModel() {
	// GLTF Object with animation - Model
	var loader = new GLTFLoader().setPath('./assets/')
	loader.load('merged_y.glb', function(gltf) {
		gltf.scene.scale.setScalar(0.13)
		gltf.scene.position.set(-47, 0, -47)
		scene.add( gltf.scene );

		mixer = new THREE.AnimationMixer( gltf.scene );
		var action0 = mixer.clipAction( gltf.animations[ 0 ] ); // Walking
		var action1 = mixer.clipAction( gltf.animations[ 1 ] ); // Standing
		action0.play();
		action1.play();
		action0.setEffectiveWeight(0)
		action1.setEffectiveWeight(1)
		
		model = gltf.scene
		// Move Character with Key
		// 87-w / 83-s / 65-a / 68-d / 32 - space
		document.addEventListener("keydown", onDocumentKeyDown, false);
		function onDocumentKeyDown(event) {
			var keyCode = event.which;
			if (keyCode == 87) {
				moveForward = true
			} else if (keyCode == 83) {
				moveBackward = true
			} else if (keyCode == 65) {
				turnLeft = true
			} else if (keyCode == 68) {
				turnRight = true
			}
			action1.setEffectiveWeight(0)
			action0.setEffectiveWeight(1)
			
		};
		document.addEventListener("keyup", onDocumentKeyUp, false);
		function onDocumentKeyUp(event) {
			var keyCode = event.which;
			if (keyCode == 87) {
				moveForward = false
			} else if (keyCode == 83) {
				moveBackward = false
			} else if (keyCode == 65) {
				turnLeft = false
			} else if (keyCode == 68) {
				turnRight = false
			} else if (keyCode == 32) {
				gltf.scene.position.set(-47, 0, -47)
				console.log("RESET POSITION BY SPACE BAR")
			}
			action0.setEffectiveWeight(0)
			action1.setEffectiveWeight(1)
			
			//action0.crossFadeFrom(action1, 1, true);
			//action0.fadeOut(1)
			//action1.fadeIn(1)
			//action0.stop();
			//action1.play();
		};
		objects.push(model); // clickable model
	})

	// // GLTF Object without animation - Chair
	// loader.load('chair.gltf', function(gltf) {
	// 	gltf.scene.scale.set(5.0, 5.5, 5.0)
	// 	gltf.scene.position.set(-47, 0, -49)
	// 	scene.add( gltf.scene )
	// })

	// GLB Object without animation - City
	loader.load('city.glb', function(gltf){
		gltf.scene.scale.setScalar(0.1)
		gltf.scene.position.set(0, 12, 0)
		scene.add(gltf.scene);
	})

	// // TEST BOX
	// const geometry = new THREE.BoxGeometry(1, 1, 1)
	// const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
	// const boxMesh = new THREE.Mesh(geometry, material)
	// boxMesh.position.set(-48, 0, -48)
	// scene.add(boxMesh)
}

function moveModel() {
	var walkSpeed = 0.3
	var turnSpeed = Math.PI/60;
	if(moveForward) {
		var direction = new THREE.Vector3()
		model.getWorldDirection(direction);
		direction.multiplyScalar(walkSpeed)
		model.position.add(direction);
	}
	if(moveBackward) {
		var direction = new THREE.Vector3()
		model.getWorldDirection(direction);
		direction.multiplyScalar(walkSpeed)
		direction.negate()
		model.position.add(direction);	
	}
	if(turnLeft) {
		model.rotation.y += turnSpeed;
	}
	if(turnRight) {
		model.rotation.y -= turnSpeed;
	}

	// Up-Right
	if(model.position.x > -30 && model.position.z < -60) {
		keyRest()
		var result = confirm("페이지가 전환됩니다.")
		if(result) {
			window.open("https://www.youtube.com/", "page")
		} else {
			model.position.set(-47, 0, -47)
		}
	}
	// Up-Left
	if(model.position.x < -60 && model.position.z < -60) {
		keyRest()
		var result = confirm("페이지가 전환됩니다.")
		if(result) {
			window.open("https://www.youtube.com/", "page")
		} else {
			model.position.set(-47, 0, -47)
		}
	}
	// Down-Left
	if(model.position.x < -60 && model.position.z > -30) {
		keyRest()
		var result = confirm("페이지가 전환됩니다.")
		if(result) {
			window.open("https://www.youtube.com/", "page")
		} else {
			model.position.set(-47, 0, -47)
		}
	}
	// Down-Right
	if(model.position.x > -30 && model.position.z > -30) {
		keyRest()
		var result = confirm("페이지가 전환됩니다.")
		if(result) {
			window.open("https://www.youtube.com/", "page")
		} else {
			model.position.set(-47, 0, -47)
		}
	}
}

function keyRest() {
	moveForward = false
	moveBackward = false
	turnLeft = false
	turnRight = false
}

function onDocumentMouseDown(event) {
	event.preventDefault();

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

	raycaster.setFromCamera( mouse, camera );
	var intersections = raycaster.intersectObjects(objects, true);
	if ( intersections.length > 0 ) {
		const object = intersections[ 0 ].object;
		console.log("Hit @ " + toString( object.name ) );
	}
}
