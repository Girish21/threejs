import "./style.css";
import * as THREE from "three";
import gsap from "gsap";
import * as dat from "lil-gui";

/**
 * Debug
 */
const gui = new dat.GUI();

const textureLoader = new THREE.TextureLoader();

const parameters = {
  materialColor: "#ffeded",
};

gui.addColor(parameters, "materialColor").onChange((val) => {
  material.color.set(val);
  particlesMaterial.color.set(val);
});

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Objects
 */
const toonTexture = textureLoader.load("/textures/gradients/3.jpg");
toonTexture.magFilter = THREE.NearestFilter;
const material = new THREE.MeshToonMaterial({
  color: parameters.materialColor,
  gradientMap: toonTexture,
});

const objectDistance = 4;

const torus = new THREE.Mesh(
  new THREE.TorusBufferGeometry(1, 0.4, 16, 60),
  material
);
torus.position.x = 2;
scene.add(torus);

const cone = new THREE.Mesh(new THREE.ConeBufferGeometry(1, 2, 32), material);
cone.position.x = -2;
cone.position.y = -objectDistance * 1;
scene.add(cone);

const torusKnot = new THREE.Mesh(
  new THREE.TorusKnotBufferGeometry(0.8, 0.35, 100, 16),
  material
);
torusKnot.position.x = 2;
torusKnot.position.y = -objectDistance * 2;
scene.add(torusKnot);

const meshes = [torus, cone, torusKnot];

// particles
const particleCount = 200;
const positions = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
  positions[i * 3 + 0] = (Math.random() - 0.5) * 10;
  positions[i * 3 + 1] =
    objectDistance * 0.5 - Math.random() * objectDistance * 3;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
}

const particlesGeometry = new THREE.BufferGeometry();
particlesGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
);
const particlesMaterial = new THREE.PointsMaterial({
  color: parameters.materialColor,
  sizeAttenuation: true,
  size: 0.03,
});
const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

// lights
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 0);
scene.add(directionalLight);

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
const cameraGroup = new THREE.Group();
scene.add(cameraGroup);
// Base camera
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 6;
cameraGroup.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * cursor
 */
const cursor = { x: 0, y: 0 };
window.addEventListener("mousemove", (e) => {
  cursor.x = e.clientX / window.innerWidth - 0.5;
  cursor.y = -(e.clientY / window.innerHeight) + 0.5;
});

/**
 * Animate
 */
const clock = new THREE.Clock();

let previous = 0;
let previousSection = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const delta = elapsedTime - previous;
  previous = elapsedTime;

  for (const mesh of meshes) {
    mesh.rotation.x += delta * 0.1;
    mesh.rotation.y += delta * 0.12;
  }

  const Y = window.scrollY / window.innerHeight;
  const section = Math.round(Y);

  camera.position.y = THREE.MathUtils.damp(
    camera.position.y,
    -Y * objectDistance,
    5,
    delta
  );
  cameraGroup.position.x += (cursor.x - cameraGroup.position.x) * 2 * delta;
  cameraGroup.position.y += (cursor.y - cameraGroup.position.y) * 2 * delta;

  if (section !== previousSection) {
    const mesh = meshes[section];
    gsap.to(mesh.rotation, {
      duration: 1.5,
      ease: "power2.inOut",
      x: "+=6",
      y: "+=3",
    });
    previousSection = section;
  }

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
