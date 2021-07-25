import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";

import vertexShader from "./Shader/Water/vertex.vert";
import fragmentShader from "./Shader/Water/fragment.frag";

/**
 * Base
 */
// Debug
const gui = new dat.GUI({ width: 340 });
const debugObject = {
  depthColor: "#090848",
  surfaceColor: "#70bbff",
};

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Water
 */
// Geometry
const waterGeometry = new THREE.PlaneGeometry(2, 2, 512, 512);

// Material
const waterMaterial = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    uTime: { value: 0 },

    uWavesSpeed: { value: 1.2 },
    uWavesElevation: { value: 0.2 },
    uWavesFrequency: { value: new THREE.Vector2(4, 1.2) },

    uWavesDepthColor: { value: new THREE.Color(debugObject.depthColor) },
    uWavesSurfaceColor: { value: new THREE.Color(debugObject.surfaceColor) },
    uColorOffset: { value: 0.15 },
    uColorMultiplier: { value: 2.5 },

    uSmallWaveElevation: { value: 0.15 },
    uSmallWaveFrequency: { value: 3 },
    uSmallWaveSpeed: { value: 0.2 },
    uSmallWaveIterations: { value: 4.0 },
  },
});

const wavesFolder = gui.addFolder("Waves");
wavesFolder.open();
wavesFolder
  .add(waterMaterial.uniforms.uWavesElevation, "value")
  .min(0)
  .max(5)
  .step(0.01)
  .name("Waves Elevation");
wavesFolder
  .add(waterMaterial.uniforms.uWavesSpeed, "value")
  .min(0)
  .max(5)
  .step(0.01)
  .name("Waves Speed");

wavesFolder
  .add(waterMaterial.uniforms.uSmallWaveElevation, "value")
  .min(0)
  .max(1)
  .step(0.001)
  .name("Small Waves Elevation");
wavesFolder
  .add(waterMaterial.uniforms.uSmallWaveFrequency, "value")
  .min(0)
  .max(5)
  .step(0.01)
  .name("Small Waves Frequency");
wavesFolder
  .add(waterMaterial.uniforms.uSmallWaveSpeed, "value")
  .min(0)
  .max(1)
  .step(0.001)
  .name("Small Waves Speed");
wavesFolder
  .add(waterMaterial.uniforms.uSmallWaveIterations, "value")
  .min(0)
  .max(5)
  .step(1.0)
  .name("Small Waves Iterations");

const waveFrequency = wavesFolder.addFolder("Waves Frequency");
waveFrequency.open();
waveFrequency
  .add(waterMaterial.uniforms.uWavesFrequency.value, "x")
  .min(0)
  .max(10)
  .step(0.1)
  .name("X");
waveFrequency
  .add(waterMaterial.uniforms.uWavesFrequency.value, "y")
  .min(0)
  .max(10)
  .step(0.1)
  .name("Y");

const wavesColor = wavesFolder.addFolder("Waves Color");
wavesColor.open();
wavesColor
  .add(waterMaterial.uniforms.uColorOffset, "value")
  .min(0.0)
  .max(2)
  .step(0.001)
  .name("Color offset");
wavesColor
  .add(waterMaterial.uniforms.uColorMultiplier, "value")
  .min(0.0)
  .max(10)
  .step(0.01)
  .name("Color multiplier");
wavesColor
  .addColor(debugObject, "depthColor")
  .onChange(() =>
    waterMaterial.uniforms.uWavesDepthColor.value.set(debugObject.depthColor)
  );
wavesColor
  .addColor(debugObject, "surfaceColor")
  .onChange(() =>
    waterMaterial.uniforms.uWavesSurfaceColor.value.set(
      debugObject.surfaceColor
    )
  );

// Mesh
const water = new THREE.Mesh(waterGeometry, waterMaterial);
water.rotation.x = -Math.PI * 0.5;
scene.add(water);

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
camera.position.set(1, 1, 1);
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

  // pass time uniform
  waterMaterial.uniforms.uTime.value = elapsedTime;

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
