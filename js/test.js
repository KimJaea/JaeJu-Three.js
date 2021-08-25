// import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js'
import * as THREE from '../three.js-master/build/three.module.js'
import {GLTFLoader} from '../three.js-master/examples/jsm/loaders/GLTFLoader.js'
import {FBXLoader} from '../three.js-master/examples/jsm/loaders/FBXLoader.js'
import {DRACOLoader} from '../three.js-master/examples/jsm/loaders/DRACOLoader.js'
import {OrbitControls} from '../three.js-master/examples/jsm/controls/OrbitControls.js'
import Stats from '../three.js-master/examples/jsm/libs/stats.module.js'
import vShader from '../shaders/vertexShader.glsl.js'
import fShader from '../shaders/fragmentShader.glsl.js'

// import * as THREE from 'https://cdn.skypack.dev/three@0127.0'
// import {GLTFLoader} from 'https://unpkg.com/three/examples/jsm/loaders/GLTFLoader.js'
// import {FBXLoader} from 'https://unpkg.com/three/examples/jsm/loaders/FBXLoader.js'
// import {DRACOLoader} from 'https://unpkg.com/three/examples/jsm/loaders/DRACOLoader.js'
// import {OrbitControls} from 'https://unpkg.com/three/examples/jsm/controls/OrbitControls.js'
// import Stats from 'https://unpkg.com/three/examples/jsm/libs/stats.module.js'

// Create Scene
const canvas = document.querySelector('.webgl')
const scene = new THREE.Scene()

// Create Shaders
const customShaderMaterial = new THREE.ShaderMaterial({
    vertexShader: vShader,
    fragmentShader: fShader
})

// Import GLB Geometry
const loader = new GLTFLoader()
loader.load('./assets/city.glb', function(glb){
    const root = glb.scene;
    root.scale.setScalar(0.01)
    scene.add(root);
})

// Ground
const mesh = new THREE.Mesh( new THREE.PlaneGeometry( 2000, 2000 ), new THREE.MeshPhongMaterial( { color: 0x042200, depthWrite: false } ) );
mesh.rotation.x = - Math.PI / 2;
mesh.receiveShadow = true;
scene.add( mesh );

// Import FBX Geometry
//let mixer;
//const loader = new FBXLoader()
//loader.load('assets/animation_fly.fbx', function(object){
//    object.scale.set(0.1, 0.1, 0.1)
//    mixer = new THREE.AnimationMixer(object)
//    const action = mixer.clipAction(object.animations[0])
//    action.play()
//    object.traverse(function(child){
//        if(child.isMesh) {
//            child.castShadow = true;
//            child.receiveShadow = true;
//        }
//    })
//    scene.add(object)
//})

// Ceate Light
const light = new THREE.AmbientLight(0x404040)
// const light = new THREE.SpotLight(0x404040, 1)
// light.position.set(2, 2, 5)
scene.add(light)

// Create Material
// const geometry = new THREE.BoxGeometry(1, 1, 1)
// const material = new THREE.MeshBasicMaterial({
//     color: 0x00ff00
// })
// const boxMesh = new THREE.Mesh(geometry, material)
// scene.add(boxMesh)

// Boiler Plate Code
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

// Create Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width/sizes.height, 0.1, 100)
// camera.position.set(0, 1, 2)
camera.position.z = 3
scene.add(camera)

// Create controler
const controls = new OrbitControls(camera, canvas)
controls.enableZoom = false
controls.enableDamping = true

const renderer = new THREE.WebGL1Renderer({
    canvas: canvas
})

// Render and Animate
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.updateShadowMap.enabled = true
renderer.gammaOutput = true
renderer.render(scene, camera)

// Make mouse control smooth
const tick = ()=>{
    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
    controls.update()
}
tick()

renderer.setClearColor(0xffffff, 1)

function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
}
animate()
