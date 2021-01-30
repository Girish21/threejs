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

// Fog
const fog = new THREE.Fog(0x262837, 2, 15);
scene.fog = fog;

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
const wallColor = textureLoader.load("/textures/bricks/color.jpg");
const wallAmbientOcclusion = textureLoader.load(
  "/textures/bricks/ambientOcclusion.jpg"
);
const wallNormal = textureLoader.load("/textures/bricks/normal.jpg");
const wallRoughness = textureLoader.load("/textures/bricks/roughness.jpg");

const doorColor = textureLoader.load("/textures/door/color.jpg");
const doorAmbientOcclusion = textureLoader.load(
  "/textures/door/ambientOcclusion.jpg"
);
const doorAlpha = textureLoader.load("/textures/door/alpha.jpg");
const doorNormal = textureLoader.load("/textures/door/normal.jpg");
const doorHeight = textureLoader.load("/textures/door/height.jpg");
const doorRoughness = textureLoader.load("/textures/door/roughness.jpg");
const doorMetalness = textureLoader.load("/textures/door/metalness.jpg");

const grassColor = textureLoader.load("/textures/grass/color.jpg");
const grassAmbientOcclusion = textureLoader.load(
  "/textures/grass/ambientOcclusion.jpg"
);
const grassNormal = textureLoader.load("/textures/grass/normal.jpg");
const grassRoughness = textureLoader.load("/textures/grass/roughness.jpg");
grassColor.repeat.set(8, 8);
grassNormal.repeat.set(8, 8);
grassRoughness.repeat.set(8, 8);
grassAmbientOcclusion.repeat.set(8, 8);

grassColor.wrapS = THREE.RepeatWrapping;
grassNormal.wrapS = THREE.RepeatWrapping;
grassRoughness.wrapS = THREE.RepeatWrapping;
grassAmbientOcclusion.wrapS = THREE.RepeatWrapping;

grassColor.wrapT = THREE.RepeatWrapping;
grassNormal.wrapT = THREE.RepeatWrapping;
grassRoughness.wrapT = THREE.RepeatWrapping;
grassAmbientOcclusion.wrapT = THREE.RepeatWrapping;

/**
 * House
 */
const house = new THREE.Group();
scene.add(house);

const walls = new THREE.Mesh(
  new THREE.BoxBufferGeometry(4, 2.5, 4),
  new THREE.MeshStandardMaterial({
    map: wallColor,
    normalMap: wallNormal,
    roughnessMap: wallRoughness,
    aoMap: wallAmbientOcclusion,
  })
);
walls.position.y = 2.5 / 2;
walls.geometry.setAttribute(
  "uv2",
  new THREE.Float32BufferAttribute(walls.geometry.attributes.uv.array, 2)
);
house.add(walls);

const roof = new THREE.Mesh(
  new THREE.ConeBufferGeometry(4, 0.75, 4),
  new THREE.MeshStandardMaterial({ color: 0xb35f45 })
);
roof.position.y = 2.5 + 0.75 / 2;
roof.rotation.y = Math.PI * 0.25;
house.add(roof);

const door = new THREE.Mesh(
  new THREE.PlaneBufferGeometry(2.2, 2.2, 100, 100),
  new THREE.MeshStandardMaterial({
    map: doorColor,
    alphaMap: doorAlpha,
    transparent: true,
    normalMap: doorNormal,
    roughnessMap: doorRoughness,
    aoMap: doorAmbientOcclusion,
    metalnessMap: doorMetalness,
    displacementMap: doorHeight,
    displacementScale: 0.1,
  })
);
door.position.z = 4 / 2 + 0.0001;
door.position.y = 2.5 / 2 - 0.25;
door.geometry.setAttribute(
  "uv2",
  new THREE.Float32BufferAttribute(door.geometry.attributes.uv.array, 2)
);
house.add(door);

// Floor
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(40, 40),
  new THREE.MeshStandardMaterial({
    map: grassColor,
    normalMap: grassNormal,
    roughnessMap: grassRoughness,
    aoMap: grassAmbientOcclusion,
  })
);

floor.rotation.x = -Math.PI * 0.5;
floor.position.y = 0;
floor.geometry.setAttribute(
  "uv2",
  new THREE.Float32BufferAttribute(floor.geometry.attributes.uv.array, 2)
);
scene.add(floor);

// Bush
const bushGeometry = new THREE.SphereBufferGeometry(1, 16, 16);
const bushMaterial = new THREE.MeshStandardMaterial({ color: 0x89c854 });

const bush1 = new THREE.Mesh(bushGeometry, bushMaterial);
bush1.scale.set(0.5, 0.5, 0.5);
bush1.position.set(0.8, 0.2, 2.2);

const bush2 = new THREE.Mesh(bushGeometry, bushMaterial);
bush2.scale.set(0.25, 0.25, 0.25);
bush2.position.set(1.4, 0.1, 2.1);

const bush3 = new THREE.Mesh(bushGeometry, bushMaterial);
bush3.scale.set(0.4, 0.4, 0.4);
bush3.position.set(-0.8, 0.1, 2.2);

const bush4 = new THREE.Mesh(bushGeometry, bushMaterial);
bush4.scale.set(0.15, 0.15, 0.15);
bush4.position.set(-1, 0.05, 2.6);

house.add(bush1, bush2, bush3, bush4);

// graves
const graves = new THREE.Group();
scene.add(graves);

const graveGeometry = new THREE.BoxBufferGeometry(0.6, 0.8, 0.2);
const graveMaterial = new THREE.MeshStandardMaterial({ color: 0xb2b6b1 });

for (let i = 0; i < 50; i++) {
  const angle = Math.random() * Math.PI * 2;
  const radius = 3.5 + Math.random() * 6;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;

  const grave = new THREE.Mesh(graveGeometry, graveMaterial);
  grave.position.set(x, 0.3, z);
  grave.castShadow = true;

  grave.rotation.y = (Math.random() - 0.5) * 0.4;
  grave.rotation.z = (Math.random() - 0.5) * 0.4;

  graves.add(grave);
}

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight("#b9d5ff", 0.12);
gui.add(ambientLight, "intensity").min(0).max(1).step(0.001);
scene.add(ambientLight);

// Directional light
const moonLight = new THREE.DirectionalLight("#b9d5ff", 0.12);
moonLight.position.set(4, 5, -2);
gui.add(moonLight, "intensity").min(0).max(1).step(0.001);
gui.add(moonLight.position, "x").min(-5).max(5).step(0.001);
gui.add(moonLight.position, "y").min(-5).max(5).step(0.001);
gui.add(moonLight.position, "z").min(-5).max(5).step(0.001);
scene.add(moonLight);

const doorLight = new THREE.PointLight(0xff7d46, 1, 5);
doorLight.position.set(0, 2.2, 2.7);
scene.add(doorLight);

const doorLightGUIFolder = gui.addFolder("DoorLight");
doorLightGUIFolder.add(doorLight.position, "y").min(0).max(10);
doorLightGUIFolder.add(doorLight.position, "z").min(0).max(10);

const doorLightHelper = new THREE.PointLightHelper(doorLight);
scene.add(doorLightHelper);
doorLightHelper.visible = false;

// Ghosts
const ghost1 = new THREE.PointLight(0xff00ff, 2, 3);
scene.add(ghost1);

const ghost2 = new THREE.PointLight(0x00ffff, 2, 3);
scene.add(ghost2);

const ghost3 = new THREE.PointLight(0xffff00, 2, 3);
scene.add(ghost3);

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
camera.position.x = 4;
camera.position.y = 2;
camera.position.z = 5;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.maxPolarAngle = Math.PI / 2 - 0.1;
controls.maxDistance = 20;
controls.minDistance = 5;
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x262837);

// Shadows
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

moonLight.castShadow = true;
doorLight.castShadow = true;
ghost1.castShadow = true;
ghost2.castShadow = true;
ghost3.castShadow = true;

walls.castShadow = true;
bush1.castShadow = true;
bush2.castShadow = true;
bush3.castShadow = true;
bush4.castShadow = true;

floor.receiveShadow = true;

doorLight.shadow.mapSize.width = 256;
doorLight.shadow.mapSize.height = 256;
doorLight.shadow.camera.far = 7;

ghost1.shadow.mapSize.width = 256;
ghost1.shadow.mapSize.height = 256;
ghost1.shadow.camera.far = 7;

ghost2.shadow.mapSize.width = 256;
ghost2.shadow.mapSize.height = 256;
ghost2.shadow.camera.far = 7;

ghost3.shadow.mapSize.width = 256;
ghost3.shadow.mapSize.height = 256;
ghost3.shadow.camera.far = 7;

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  const ghost1Angle = elapsedTime * 0.5;
  ghost1.position.x = Math.cos(ghost1Angle) * 4;
  ghost1.position.z = Math.sin(ghost1Angle) * 4;
  ghost1.position.y = Math.sin(elapsedTime * 3);

  const ghost2Angle = -elapsedTime * 0.32;
  ghost2.position.x = Math.cos(ghost2Angle) * 5;
  ghost2.position.z = Math.sin(ghost2Angle) * 5;
  ghost2.position.y = Math.sin(elapsedTime * 4) + Math.sin(elapsedTime * 2.5);

  const ghost3Angle = -elapsedTime * 0.18;
  ghost3.position.x =
    Math.cos(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.32));
  ghost3.position.z = Math.sin(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.5));
  ghost3.position.y = Math.sin(elapsedTime * 4) + Math.sin(elapsedTime * 2.5);

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
