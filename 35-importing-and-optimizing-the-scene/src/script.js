import "./style.css";
import * as dat from "dat.gui";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import FireFliesVertexShader from "./shaders/fire_flies/vertex.glsl";
import FireFliesFragmentShader from "./shaders/fire_flies/fragment.glsl";
import PortalVertexShader from "./shaders/portal/vertex.glsl";
import PortalFragmentShader from "./shaders/portal/fragment.glsl";

/**
 * Base
 */
// Debug
const debugObject = {};
const gui = new dat.GUI({
  width: 400,
});

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader();

// Draco loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("draco/");

// GLTF loader
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

/**
 * Texture
 */
const texture = textureLoader.load("/threejs_backed.jpg");
texture.flipY = false;
texture.encoding = THREE.sRGBEncoding;

/**
 * Backed material
 */
const bakedMaterial = new THREE.MeshBasicMaterial({ map: texture });
const poleLightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffe5 });
const portalLightMaterial = new THREE.ShaderMaterial({
  vertexShader: PortalVertexShader,
  fragmentShader: PortalFragmentShader,
  uniforms: {
    uTime: { value: 0 },
    uColorStart: { value: new THREE.Color(0x78f00f) },
    uColorEnd: { value: new THREE.Color(0x3eabff) },
  },
});
debugObject.portalColorStart = "#78f00f";
debugObject.portalColorEnd = "#3eabff";
gui
  .addColor(debugObject, "portalColorStart")
  .onChange(
    (color) =>
      (portalLightMaterial.uniforms.uColorStart.value = new THREE.Color(color))
  );
gui
  .addColor(debugObject, "portalColorEnd")
  .onChange(
    (color) =>
      (portalLightMaterial.uniforms.uColorEnd.value = new THREE.Color(color))
  );

/**
 * Model
 */
gltfLoader.load("/threejs_scene.glb", (model) => {
  model.scene.traverse((mesh) => {
    if (/^polelight/i.test(mesh.name)) {
      mesh.material = poleLightMaterial;
    } else if (/^portal/i.test(mesh.name)) {
      mesh.material = portalLightMaterial;
    } else {
      mesh.material = bakedMaterial;
    }
  });
  scene.add(model.scene);
});

/**
 * Fireflies
 */
const fireFliesGeometry = new THREE.BufferGeometry();
const fireFliesMaterial = new THREE.ShaderMaterial({
  vertexShader: FireFliesVertexShader,
  fragmentShader: FireFliesFragmentShader,
  uniforms: {
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    uSize: { value: 100.0 },
    uTime: { value: 0 },
  },
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});

const fireFliesCount = 30;
const positionArray = new Float32Array(fireFliesCount * 3);
const scaleArray = new Float32Array(fireFliesCount);

for (let i = 0; i < fireFliesCount; i++) {
  positionArray[i * 3 + 0] = (Math.random() - 0.5) * 4;
  positionArray[i * 3 + 1] = Math.random() * 1.5;
  positionArray[i * 3 + 2] = (Math.random() - 0.5) * 4;
  scaleArray[i] = Math.random();
}

fireFliesGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positionArray, 3)
);
fireFliesGeometry.setAttribute(
  "aScale",
  new THREE.BufferAttribute(scaleArray, 1)
);

const fireFlies = new THREE.Points(fireFliesGeometry, fireFliesMaterial);
scene.add(fireFlies);

gui
  .add(fireFliesMaterial.uniforms.uSize, "value")
  .min(0)
  .max(500)
  .step(1)
  .name("fire flies size")
  .onChange((value) => (fireFliesMaterial.uniforms.uSize.value = value));

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  fireFliesMaterial.uniforms.uPixelRatio.value = Math.min(
    window.devicePixelRatio,
    2
  );

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  45,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 4;
camera.position.y = 2;
camera.position.z = 4;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputEncoding = THREE.sRGBEncoding;

debugObject.clearColor = 0x310606;
renderer.setClearColor(debugObject.clearColor);
gui
  .addColor(debugObject, "clearColor")
  .onChange((color) => renderer.setClearColor(color));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  fireFliesMaterial.uniforms.uTime.value = elapsedTime;
  portalLightMaterial.uniforms.uTime.value = elapsedTime;

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
