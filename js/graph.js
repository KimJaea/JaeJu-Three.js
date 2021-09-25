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
	camera = new THREE.PerspectiveCamera( 75, (window.innerWidth * ratioWidth) / (window.innerHeight * ratioHeight), 0.5, 2000 );
	camera.position.set( 0, 200, 300 );
	// Set Scene
	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0xee99aa );
	
	clock = new THREE.Clock();

	// Light From Camera
	const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
	hemiLight.position.set( 0, 200, 0 );
	scene.add( hemiLight );
	// Light of Sun
	const dirLight = new THREE.DirectionalLight( 0xffffff );
	dirLight.position.set( 0, 0, 100 );
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
	controls.minDistance = 200;
	controls.maxDistance = 300;
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
	loader.load('Class.glb', function(gltf) {
        var obj = gltf.scene;
		obj.position.set(0, 50, 300);
		obj.rotation.y = 1.5;
		scene.add( obj );
	})
	
	// import data from server
    //var dp = {{ value|tojson }};
	var data = [[['2021_8_08', 1, 0.9164004780000438],
    ['2021_9_08', 1, 0.9164004780000438],
    ['2021_9_18', 0, 0.9164004780273438],
    ['2021_9_19', 0, 0.9159774780273438]],
	[[0.2, 0.4, 2.0, 3.0, -25.0, -3.0, 2.0, 2.20, 2.0, 2.0,
		2.0, 2.0, 12.0, 9.0, -10.0, 1.0, -6.0, 2.0, 5.0, -7.0,
		-2.0, -12.0, 12.0, -9.0, 10.0, 1.0, -6.0, 2.0, 5.0, -7.0]],
    [['depression_insomnia', 'depression_insomnia', 'depression_dazed'],
    ['sadness_miserable', 'depression_insomnia', 'sadness_miserable'],
    ['depression_gloomy', 'depression_confidence', 'depression_dazed', 'depression_concentration'],
    ['depression_lethargy', 'depression_lethargy', 'sadness_upset', 'sadness_upset'],
    ['angry_resentment', 'angry_resentment', 'lonely_meaningless', 'sadness_regret']]]

    var data_eeg = data[0];
	var data_raw = data[1];
    var data_chat = data[2];

	// Load Pie Chart & Text - Depression
	var pieValues = [0, 0];
	for(let i = 0; i < data_eeg.length; i++) {
		if(data_eeg[i][1] == 1) {
			pieValues[1]++;
		} else {
			pieValues[0]++;
		}
	}
	var pieItems = ["우울증", "우울증_아님"]
	loadPieChart(pieValues,  pieItems);

	// Load Line Chart & Text
	loadLineChart(data_raw[0]);

	// Load Bar Chart & Text
	var symptomNames_ = [ 'depression', 'sadness', 'lonely', 'angry']
    var symptomNames_kr = [ '우울증', '슬픔', '외로움', '분노']

    var symptomDepression_ = ['depression', 'depression_gloomy', 'depression_dazed', 'depression_lethargy', 'depression_desire', 'depression_insomnia',
    'depression_interest', 'depression_appetite', 'depression_confidence', 'depression_loser', 'depression_concentration']
    var symptomSadness_ = ['sadness', 'sadness_upset', 'sadness_tear', 'sadness_cry', 'sadness_guilty', 'sadness_miss', 'sadness_remorse',
    'sadness_sad', 'sadness_miserable', 'sadness_vanity', 'sadness_despair', 'sadness_unfair', 'sadness_regret', 'sadness_disappointment']
    var symptomLonely_ = ['lonely', 'lonely_meaningless', 'lonely_suitability', 'lonely_smolder', 'lonely_hard' ]
    var symptomAngry_ = ['angry', 'angry_resentment', 'angry_dissatisfaction']

    var symptomDepression_kr = ['우울함', '침울함', '멍함', '무기력', '의욕 없음', '불면증',
    '흥미 없음', '식욕 없음', '자존감 하락', '패배감', '집중력 하락']
    var symptomSadness_kr = ['슬픔', '속상', '눈물', '울음', '죄책감', '그리움', '연민',
    '서러움', '비참함', '허망함', '절망', '억울함', '후회', '서운함']
    var symptomLonely_kr = ['외로움', '무의미', '적적함', '울적', '고단함' ]
    var symptomAngry_kr = ['분노', '원망', '불만']

    var symptomDepression_count = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    var symptomSadness_count = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    var symptomLonely_count = [0, 0, 0, 0, 0 ]
    var symptomAngry_count = [0, 0, 0]

    for(let i = 0; i < data_chat.length; i++) {
        for(let j = 0; j < data_chat[i].length; j++) {
            const symptom = data_chat[i][j];
            for(let k = 0; k < symptomNames_.length; k++) {
                if(symptom.indexOf(symptomNames_[k]) == 0) {
                    let num = 0;
                    switch(k) {
                        case 0: // 우울증
                            num = symptomDepression_.indexOf(symptom);
                            symptomDepression_count[num]++;
                            break;
                        case 1: // 슬픔
                            num = symptomSadness_.indexOf(symptom);
                            symptomSadness_count[num]++;
                            break;
                        case 2: // 외로움
                            num = symptomLonely_.indexOf(symptom);
                            symptomLonely_count[num]++;
                            break;
                        case 3: // 분노
                            num = symptomAngry_.indexOf(symptom);
                            symptomAngry_count[num]++;
                            break;
                    }

                    break;
                }
            }
        }
    }
	
	loadBarChart(symptomDepression_count, symptomDepression_kr);
}

function loadPieChart(values, items) {
	const pie_radius = 100;
	const pie_height = 10;
	const pie_segment = 28;
	
	var sum = 0;
	for(let i = 0; i < values.length; i++) {
		sum += values[i];
	}

	const colors = [0x123456, 0x789abc]
	var start_value = 0;
	for(let i = 0; i < values.length; i++) {
		const value = (values[i] / sum * 2) * Math.PI;
		const geometry = new THREE.CylinderGeometry( pie_radius, pie_radius, pie_height, pie_segment, 1, false, start_value, value );
		const material = new THREE.MeshBasicMaterial( {color: colors[i]} );
		const cylinder = new THREE.Mesh( geometry, material );
		cylinder.position.set(0, 0, 400);
		cylinder.rotation.x += Math.PI / 2;
		cylinder.rotation.z -= Math.PI;
		scene.add( cylinder );
		const pos = new THREE.Vector3(cylinder.position.x - pie_radius, cylinder.position.y + 10 + i * 25, cylinder.position.z);
		loadText(items[i], pos, Math.PI, colors[i]);
		start_value += value;
	}
}

function loadBarChart(values, items) {
	const barUnit = 20;
	const barMulti = 50;

	for(let i = 0; i < values.length; i++) {
		const geometry = new THREE.BoxGeometry( barUnit, values[i] * barMulti, barUnit );
		const color = Math.random() * 0xbbbbbb + 0x444444;
		const material = new THREE.MeshBasicMaterial( {color: color} );
		const cube = new THREE.Mesh( geometry, material );
		cube.position.set(400, values[i] * barMulti / 2 - 100,  barUnit*i);
		scene.add( cube );

		const pos = new THREE.Vector3(400, i * 25, -100);
		loadText(items[i], pos, -Math.PI / 2, color);
	}
	
}

function loadLineChart(values) {
	const lineUnit = 5;
	const points = []; 
	for(let i = 0; i < values.length; i++) {
		points.push(new THREE.Vector3(-250 + lineUnit * i, values[i], -400));
	}
	
	const geometry = new THREE.BufferGeometry().setFromPoints( points );
	const material = new THREE.MeshBasicMaterial( {color: 0xffffff} );
	const line = new THREE.Line( geometry, material );
	scene.add( line );
	
	const pos = new THREE.Vector3(0, 100, -400);
	loadText("뇌파의_파형", pos, 0, 0xffffff);
}

function loadText(string_name, string_loc, string_rot, string_color) {
	if(text) {
		text.parent.remove(text)
	}

	// Create Text Geometry
	const loader = new THREE.FontLoader();
	loader.load( '../assets/Do_Hyeon/Do_Hyeon_Regular.json', function(font) {
		geometry = new THREE.TextGeometry(string_name, {
			font: font,
			size: 20,
			height: 2,
		})
		text = new THREE.Mesh(geometry, [
			new THREE.MeshPhongMaterial({ color: string_color }), //font
			new THREE.MeshPhongMaterial({ color: string_color }) //side
		])
		text.castShadow = true
		text.position.set(string_loc.x, string_loc.y, string_loc.z)
		text.rotateY(string_rot)
		scene.add(text)
	})
}
