import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/build/three.module.js';
import {OrbitControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/loaders/GLTFLoader.js';
import Stats from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/libs/stats.module.js'

var container, stats, controls, mixer, clock;
var camera, scene, renderer;
var ratioWidth = 1.0, ratioHeight = 0.9;

var geometry, text, button = ["", ""];

var moveForward = false, moveBackward = false, turnLeft = false, turnRight = false;
var model, lastAction, activeAction, current_walkSpeed = 0, current_turnSpeed = 0;

var mouse = new THREE.Vector2(), raycaster = new THREE.Raycaster(), objects = [];
var chatbot;

init();
animate();
onWindowResize();

function init() {
	// Create Scene
	container = document.createElement( 'div' );
	document.body.appendChild( container );
	// Set Camera
	camera = new THREE.PerspectiveCamera( 75, (window.innerWidth * ratioWidth) / (window.innerHeight * ratioHeight), 0.5, 1000 );
	camera.position.set( -30, 20, -30 );
	// Set Scene
	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0x6dddff );
	
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
	renderer.setAnimationLoop();
	renderer.gammaOutput = true;
	container.appendChild( renderer.domElement );

	// Event Listener
	window.addEventListener( 'resize', onWindowResize, true );
	document.addEventListener( 'mousedown', onDocumentMouseDown, false );

	// Create controler
	controls = new OrbitControls( camera, renderer.domElement );
	controls.enableZoom = true
	controls.enableDamping = true
	controls.minDistance = 10;
	controls.maxDistance = 40;
	controls.target.set( -48, 5, -48 );
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
	requestAnimationFrame( animate );
	var delta = clock.getDelta();
	if ( mixer ) mixer.update( delta );
	if ( model ) moveModel(); // KeyDown & KeyUp
	renderer.render( scene, camera );
	stats.update();
}

function onWindowResize() {
	camera.aspect = (window.innerWidth * ratioWidth) / (window.innerHeight * ratioHeight );
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth * ratioWidth, window.innerHeight * ratioHeight );
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
		action0.setEffectiveWeight(0);
		action1.play();
		lastAction = action0;
		activeAction = action1;
		
		model = gltf.scene
		// Move Character with Key
		// 87-w / 83-s / 65-a / 68-d / 32 - space
		document.addEventListener("keydown", onDocumentKeyDown, false);
		function onDocumentKeyDown(event) {
			var keyCode = event.which;
			if (keyCode == 87) {
				moveForward = true
                setAction(action0);
			} else if (keyCode == 83) {
				moveBackward = true
                setAction(action0);
			} else if (keyCode == 65) {
				turnLeft = true
                setAction(action0);
			} else if (keyCode == 68) {
				turnRight = true
                setAction(action0);
			}
		};
		document.addEventListener("keyup", onDocumentKeyUp, false);
		function onDocumentKeyUp(event) {
			var keyCode = event.which;
			if (keyCode == 87) {
				moveForward = false
                setAction(action1);
			} else if (keyCode == 83) {
				moveBackward = false
                setAction(action1);
			} else if (keyCode == 65) {
				turnLeft = false
                setAction(action1);
			} else if (keyCode == 68) {
				turnRight = false
                setAction(action1);
			}
		};
		objects.push(model); // clickable model
	})
	chatbot = true;

	// GLB Object without animation - City
	loader.load('city.glb', function(gltf){
		gltf.scene.scale.setScalar(0.1)
		gltf.scene.position.set(0, 12, 0)
		scene.add(gltf.scene);
	})

	// Load Text above Building
	// Up-Right
	loadTextEng("Send EEG", new THREE.Vector3(-25, 20, -75), -Math.PI / 4); 
	// Up-Left
	loadTextEng("Hospital", new THREE.Vector3(-65, 20, -65), Math.PI / 4); 
	// Down-Left
	loadTextEng("Record", new THREE.Vector3(-65, 20, -20), Math.PI / 4* 3); 
	// Down-Right
	loadTextEng("Contact", new THREE.Vector3(-25, 20, -25), -Math.PI / 4* 3); 
}

function moveModel() {
	// smooth animation
	if(lastAction.getEffectiveWeight() > 0)
		lastAction.setEffectiveWeight(lastAction.getEffectiveWeight() - 0.05)
	if(activeAction.getEffectiveWeight() < 1)
		activeAction.setEffectiveWeight(activeAction.getEffectiveWeight() + 0.05)

	// smooth movement
	var walkSpeed = 0.3
	var turnSpeed = Math.PI/45;
	if(moveForward || moveBackward ) {
		if(current_walkSpeed < walkSpeed) {
			current_walkSpeed += walkSpeed * 0.01
		}
	} else {
		if(current_walkSpeed > 0) {
			current_walkSpeed -= walkSpeed * 0.01
		}
	}
	if(turnLeft || turnRight ) {
		if(current_turnSpeed < turnSpeed) {
			current_turnSpeed += turnSpeed * 0.01
		}
	} else {
		if(current_turnSpeed > 0) {
			current_turnSpeed -= turnSpeed * 0.01
		}
	}
	
	// movement speed
	if(moveForward) {
		var direction = new THREE.Vector3()
		model.getWorldDirection(direction);
		direction.multiplyScalar(current_walkSpeed)
		model.position.add(direction);
	}
	if(moveBackward) {
		var direction = new THREE.Vector3()
		model.getWorldDirection(direction);
		
		direction.multiplyScalar(current_walkSpeed)
		direction.negate()
		model.position.add(direction);	
	}
	if(turnLeft) {
		model.rotation.y += current_turnSpeed;
	}
	if(turnRight) {
		model.rotation.y -= current_turnSpeed;
	}

	// Up-Right // Send EEG
	if(model.position.x > -30 && model.position.z < -60) {
		keyReset();
		//loadButton("뇌파_측정", "/eeg", new THREE.Vector3(-25, 10, -75), -Math.PI / 4);
		loadPopUp("/eeg");
	}
	// Up-Left // Hospital
	if(model.position.x < -60 && model.position.z < -60) {
		keyReset()
		var result = confirm("페이지가 전환됩니다.")
		if(result) {
			window.open("/map", "page")
		}
	}
	// Down-Left // Record
	if(model.position.x < -60 && model.position.z > -30) {
		keyReset()
		var result = confirm("페이지가 전환됩니다.")
		if(result) {
			window.open("/graph", "page")
		}
	}
	// Down-Right // Contact
	if(model.position.x > -30 && model.position.z > -30) {
		keyReset()
		var result = confirm("페이지가 전환됩니다.")
		if(result) {
			window.open("https://github.com/KimJaea/JaeJu-GetEEG", "page")
		}
	}
}

function keyReset() {
	moveForward = false
	moveBackward = false
	turnLeft = false
	turnRight = false
	model.position.set(-47, 0, -47)
}

function setAction (toAction) {	
	if (toAction == activeAction) {		
		return
	} else {
		lastAction = activeAction
		activeAction = toAction
		
		lastAction.stop()
		lastAction.setEffectiveWeight(lastAction.getEffectiveWeight() - 0.05)
		activeAction.reset()
		activeAction.setEffectiveWeight(activeAction.getEffectiveWeight() + 0.05)
		activeAction.play()
	}
}

// Recognize Character Click
function onDocumentMouseDown(event) {
	event.preventDefault();

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / (window.innerHeight * 0.9) - (window.innerHeight * 0.0001)) * 2 + 1;

	raycaster.setFromCamera( mouse, camera );
	var intersections = raycaster.intersectObjects(objects, true);
	if ( intersections.length > 0 ) {
		const object = intersections[ 0 ].object;
		if(object == button[0]) {
			window.open(button[1], "page");
		} else {
			callChatBot();
		}
	}
}

function callChatBot() {
	if(!chatbot){
		chatbot = true;
		var rasa = document.getElementById("rasaWebchatPro");
		rasa.style.display = "block";
	} else {
		chatbot = false;
		var rasa = document.getElementById("rasaWebchatPro");
		rasa.style.display = "none";
	}
}

function loadTextEng(string_name, string_loc, string_rot) {
	// Create Text Geometry
	const loader = new THREE.FontLoader();
	loader.load( '../assets/roboto/Roboto_Regular.json', function(font) {
		var geometry = new THREE.TextGeometry(string_name, {
			font: font,
			size: 3,
			height: 2,
		})
		var text = new THREE.Mesh(geometry, [
			new THREE.MeshPhongMaterial({ color: 0xad4000 }), //font
			new THREE.MeshPhongMaterial({ color: 0x5c2301 }) //side
		])
		text.castShadow = true
		text.position.set(string_loc.x, string_loc.y, string_loc.z)
		text.rotateY(string_rot)
		scene.add(text)
	})
}

function loadTextKr(string_name, string_loc, string_rot) {
	// Create Text Geometry
	const loader = new THREE.FontLoader();
	loader.load( '../assets/Do_Hyeon/Do_Hyeon_Regular.json', function(font) {
		geometry = new THREE.TextGeometry(string_name, {
			font: font,
			size: 2,
			height: 2,
		})
		text = new THREE.Mesh(geometry, [
			new THREE.MeshPhongMaterial({ color: 0xad4000 }), //font
			new THREE.MeshPhongMaterial({ color: 0x5c2301 }) //side
		])
		text.castShadow = true
		text.position.set(string_loc.x, string_loc.y, string_loc.z)
		text.rotateY(string_rot)
		scene.add(text)
	})
}

function loadButton(string_name, string_add, string_loc, string_rot) {
	// Create Text
	const posKr = new THREE.Vector3(string_loc.x, string_loc.y - 3, string_loc.z);
	loadTextKr(string_name, posKr, string_rot);
	const posEng = new THREE.Vector3(posKr.x, posKr.y - 3, posKr.z);
	loadTextEng("Click Here!", posEng, string_rot);
	
	// Create Box
	const geometry = new THREE.BoxGeometry( 20, 10, 1 );
	const material = new THREE.MeshBasicMaterial( {color: 0xeeeeee} );
	const cube = new THREE.Mesh( geometry, material );
	cube.position.set(string_loc.x + 5, string_loc.y - 5, string_loc.z +5);
	cube.rotateY(string_rot);
	scene.add( cube );
	
	objects.push(cube);
	button[0] = cube;
	button[1] = string_add;
}

function loadPopUp(address) {

	var popupX = (document.body.offsetWidth / 2) - (200 / 2);
	var popupY= (window.screen.height / 2) - (300 / 2);

	window.open('페이지를 전환', '', 'status=no, height=300, width=200, left='+ popupX + ', top='+ popupY);
	
	// var result = confirm("페이지가 전환됩니다.")
	// if(result) {
	// 	window.open(address, "page")
	// }
		
}