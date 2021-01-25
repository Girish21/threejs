import {
  BoxGeometry,
  Clock,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import gsap from "gsap";

import "./style.css";

const canvas = document.querySelector(".webgl");

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const scene = new Scene();

const box = new BoxGeometry(1, 1, 1);
const material = new MeshBasicMaterial({ color: "red" });
const mesh = new Mesh(box, material);
scene.add(mesh);

const camera = new PerspectiveCamera(45, sizes.width / sizes.height);
camera.position.z = 3;
scene.add(camera);

const renderer = new WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.render(scene, camera);

gsap.to(mesh.position, { x: 2, duration: 1, delay: 1 });

// const clock = new Clock();

const tick = function () {
  //   const elapsedTime = clock.getElapsedTime();

  //   camera.position.x = Math.sin(elapsedTime);
  //   camera.position.y = Math.cos(elapsedTime);

  //   camera.lookAt(mesh.position);

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
};

tick();
