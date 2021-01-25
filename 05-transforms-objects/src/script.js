import {
  AxesHelper,
  BoxGeometry,
  Group,
  Mesh,
  MeshNormalMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import "./style.css";

const canvas = document.querySelector(".webgl");

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const scene = new Scene();

const group = new Group();

const cube1 = new Mesh(new BoxGeometry(1, 1, 1), new MeshNormalMaterial());
const cube2 = new Mesh(new BoxGeometry(1, 1, 1), new MeshNormalMaterial());
cube2.position.x = -2;
const cube3 = new Mesh(new BoxGeometry(1, 1, 1), new MeshNormalMaterial());
cube3.position.x = 2;
group.add(cube1);
group.add(cube2);
group.add(cube3);

const axis = new AxesHelper(3);
scene.add(axis);

const camera = new PerspectiveCamera(45, sizes.width / sizes.height);
camera.position.z = 5;

group.position.y = -1;

scene.add(group);

const renderer = new WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.render(scene, camera);
