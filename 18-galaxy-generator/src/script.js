import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import debounce from "lodash.debounce";

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// scene.add(new THREE.AxesHelper());

/**
 * Galaxy
 */
const parameters = {
  count: 100000,
  size: 0.01,
  radius: 5,
  branches: 3,
  spin: 1,
  randomness: 0.2,
  randomnessPower: 3,
  insideColor: 0xff6030,
  outsideColor: 0x1b3984,
};

let particleGeometry;
let particleMaterial;
let particles;

function generateGalaxy() {
  if (particleGeometry) particleGeometry.dispose();
  if (particleMaterial) particleMaterial.dispose();
  if (particles) scene.remove(particles);

  const vertices = new Float32Array(parameters.count * 3);
  const colors = new Float32Array(parameters.count * 3);

  const colorInside = new THREE.Color(parameters.insideColor);
  const colorOutside = new THREE.Color(parameters.outsideColor);

  for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3;

    const radius = Math.random() * parameters.radius;
    const spin = radius * parameters.spin;
    const branchesAngle =
      ((i % parameters.branches) / parameters.branches) * (Math.PI * 2);

    const randomX =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      parameters.randomness *
      radius;
    const randomY =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      parameters.randomness *
      radius;
    const randomZ =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      parameters.randomness *
      radius;

    const mixedColor = colorInside.clone();
    mixedColor.lerp(colorOutside, radius / parameters.radius);

    vertices[i3] = Math.cos(branchesAngle + spin) * radius + randomX;
    vertices[i3 + 1] = randomY;
    vertices[i3 + 2] = Math.sin(branchesAngle + spin) * radius + randomZ;

    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
  }

  particleGeometry = new THREE.BufferGeometry();
  particleMaterial = new THREE.PointsMaterial({
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    size: parameters.size,
    vertexColors: true,
  });

  particleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(vertices, 3)
  );
  particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  particles = new THREE.Points(particleGeometry, particleMaterial);

  scene.add(particles);
}
generateGalaxy();

const particleGui = gui.addFolder("Galaxy");
particleGui
  .add(parameters, "count")
  .min(0)
  .max(100000)
  .step(100)
  .onChange(debounce(generateGalaxy, 500));
particleGui
  .add(parameters, "size")
  .min(0)
  .max(0.5)
  .step(0.0001)
  .onChange(debounce(generateGalaxy, 500));
particleGui
  .add(parameters, "radius")
  .min(1)
  .max(10)
  .step(1)
  .onChange(debounce(generateGalaxy, 500));
particleGui
  .add(parameters, "branches")
  .min(2)
  .max(10)
  .step(1)
  .onChange(debounce(generateGalaxy, 500));
particleGui
  .add(parameters, "spin")
  .min(1)
  .max(10)
  .step(1)
  .onChange(debounce(generateGalaxy, 500));
particleGui
  .add(parameters, "randomness")
  .min(0)
  .max(2)
  .step(0.001)
  .onChange(debounce(generateGalaxy, 500));
particleGui
  .add(parameters, "randomnessPower")
  .min(1)
  .max(10)
  .step(0.1)
  .onChange(debounce(generateGalaxy, 500));
particleGui
  .addColor(parameters, "insideColor")
  .onChange(debounce(generateGalaxy, 500));
particleGui
  .addColor(parameters, "outsideColor")
  .onChange(debounce(generateGalaxy, 500));

particleGui.open();

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
camera.position.x = 3;
camera.position.y = 3;
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
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

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
