import {
  BoxGeometry,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  WebGLRenderer,
  Scene,
} from "three";
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
