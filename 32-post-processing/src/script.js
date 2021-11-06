import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { DotScreenPass } from "three/examples/jsm/postprocessing/DotScreenPass";
import { GlitchPass } from "three/examples/jsm/postprocessing/GlitchPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { RGBShiftShader } from "three/examples/jsm/shaders/RGBShiftShader";
import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader";
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass";

import * as dat from "lil-gui";

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
 * Loaders
 */
const gltfLoader = new GLTFLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();
const textureLoader = new THREE.TextureLoader();

/**
 * Update all materials
 */
const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (
      child instanceof THREE.Mesh &&
      child.material instanceof THREE.MeshStandardMaterial
    ) {
      child.material.envMapIntensity = 2.5;
      child.material.needsUpdate = true;
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
};

/**
 * Environment map
 */
const environmentMap = cubeTextureLoader.load([
  "/textures/environmentMaps/0/px.jpg",
  "/textures/environmentMaps/0/nx.jpg",
  "/textures/environmentMaps/0/py.jpg",
  "/textures/environmentMaps/0/ny.jpg",
  "/textures/environmentMaps/0/pz.jpg",
  "/textures/environmentMaps/0/nz.jpg",
]);
environmentMap.encoding = THREE.sRGBEncoding;

scene.background = environmentMap;
scene.environment = environmentMap;

/**
 * Models
 */
gltfLoader.load("/models/DamagedHelmet/glTF/DamagedHelmet.gltf", (gltf) => {
  gltf.scene.scale.set(2, 2, 2);
  gltf.scene.rotation.y = Math.PI * 0.5;
  scene.add(gltf.scene);

  updateAllMaterials();
});

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight("#ffffff", 3);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.normalBias = 0.05;
directionalLight.position.set(0.25, 3, -2.25);
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

  effectComposer.setSize(sizes.width, sizes.height);
  effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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
camera.position.set(4, 1, -4);
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
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 1.5;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// const renderTarget = new THREE.WebGLRenderTarget(800, 600, );
const rendererOptions = {
  minFilter: THREE.LinearFilter,
  magFilter: THREE.LinearFilter,
  format: THREE.RGBAFormat,
};
let RenderTarget = null;

if (renderer.capabilities.isWebGL2 && renderer.getPixelRatio() === 1) {
  RenderTarget = THREE.WebGLMultisampleRenderTarget;
} else {
  RenderTarget = THREE.WebGLRenderTarget;
}

const renderTarget = new RenderTarget(800, 600, rendererOptions);

const effectComposer = new EffectComposer(renderer, renderTarget);
effectComposer.setSize(sizes.width, sizes.height);
effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const pass = new RenderPass(scene, camera);
effectComposer.addPass(pass);

const dotScreenPass = new DotScreenPass();
dotScreenPass.enabled = false;
effectComposer.addPass(dotScreenPass);

const glitchPass = new GlitchPass();
glitchPass.enabled = false;
effectComposer.addPass(glitchPass);

const rgbShiftPass = new ShaderPass(RGBShiftShader);
rgbShiftPass.enabled = false;
effectComposer.addPass(rgbShiftPass);

const bloomPass = new UnrealBloomPass();
bloomPass.strength = 0.8;
bloomPass.radius = 1;
bloomPass.threshold = 0.6;
bloomPass.enabled = true;
effectComposer.addPass(bloomPass);

gui.add(bloomPass, "enabled");
gui.add(bloomPass, "strength").min(0).max(2).step(0.001);
gui.add(bloomPass, "radius").min(0).max(2).step(0.001);
gui.add(bloomPass, "threshold").min(0).max(1).step(0.001);

const TintPass = {
  uniforms: {
    tDiffuse: { value: null },
    uRed: { value: 0.0 },
    uGreen: { value: 0.0 },
    uBlue: { value: 0.0 },
  },
  vertexShader: `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uRed;
    uniform float uGreen;
    uniform float uBlue;

    varying vec2 vUv;

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      color.r += uRed;
      color.g += uGreen;
      color.b += uBlue;
      gl_FragColor = color;
    }
  `,
};
const tintPass = new ShaderPass(TintPass);
tintPass.enabled = false;
effectComposer.addPass(tintPass);

gui
  .add(tintPass.uniforms.uRed, "value")
  .min(0)
  .max(1.0)
  .step(0.0001)
  .name("Red");
gui
  .add(tintPass.uniforms.uGreen, "value")
  .min(0)
  .max(1.0)
  .step(0.0001)
  .name("Green");
gui
  .add(tintPass.uniforms.uBlue, "value")
  .min(0)
  .max(1.0)
  .step(0.0001)
  .name("Blue");

const DisplacementPass = {
  uniforms: {
    tDiffuse: { value: null },
    uNormalMap: { value: null },
  },
  vertexShader: `
      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
      }
    `,
  fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform sampler2D uNormalMap;

      varying vec2 vUv;

      void main() {
        vec3 normalColor = texture2D(uNormalMap, vUv).xyz * 2. - 1.;
        vec2 newUv = vUv + normalColor.xy * .1;

        vec4 color = texture2D(tDiffuse, newUv);

        vec3 lightDirection = normalize(vec3(-1., 1., 0.));
        float lightness = clamp(dot(normalColor, lightDirection), 0., 1.);
        color += lightness * 2.;

        gl_FragColor = color;
        // gl_FragColor = vec4(newUv, 0., 1.);
      }
    `,
};

const displacementPass = new ShaderPass(DisplacementPass);
textureLoader.load("/textures/interfaceNormalMap.png", (texture) => {
  displacementPass.uniforms.uNormalMap.value = texture;
});
effectComposer.addPass(displacementPass);

const gammaShiftPass = new ShaderPass(GammaCorrectionShader);
effectComposer.addPass(gammaShiftPass);

const smaaPass = new SMAAPass();
smaaPass.enabled =
  renderer.getPixelRatio() === 1 && !renderer.capabilities.isWebGL2;
effectComposer.addPass(smaaPass);

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  // Render
  //   renderer.render(scene, camera);
  effectComposer.render();

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
