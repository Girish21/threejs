import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();

const particleTexture = textureLoader.load("/textures/particles/8.png");

/**
 * Particles
 */
// const particleGeometry = new THREE.SphereBufferGeometry(1, 32, 32);
// const particleGeometry = new THREE.BoxBufferGeometry(2, 2, 2, 20, 20, 20);
const particleGeometry = new THREE.BufferGeometry();
const size = 20000;
const vertices = new Float32Array(size * 3);
const color = new Float32Array(size * 3);
for (let i = 0; i < size * 3; i++) {
  vertices[i] = (Math.random() - 0.5) * 10;
  color[i] = Math.random();
}
particleGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(vertices, 3)
);
particleGeometry.setAttribute("color", new THREE.BufferAttribute(color, 3));

const particlesMaterial = new THREE.PointsMaterial({
  size: 0.1,
  sizeAttenuation: true,
  alphaMap: particleTexture,
  transparent: true,
  //   color: "hotpink",
  //   alphaTest: 0.001,
  //   depthTest: false,
  vertexColors: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
});

const particle = new THREE.Points(particleGeometry, particlesMaterial);
scene.add(particle);

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

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.maxDistance = 5;
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  for (let i = 0; i < size; i++) {
    const i3 = i * 3;
    const x = particleGeometry.attributes.position.array[i3];
    particleGeometry.attributes.position.array[i3 + 1] = Math.sin(
      elapsedTime + x
    );
  }
  particleGeometry.attributes.position.needsUpdate = true;

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
