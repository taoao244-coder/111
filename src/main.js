import * as THREE from "https://unpkg.com/three@0.161.0/build/three.module.js";
import { EffectComposer } from "https://unpkg.com/three@0.161.0/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://unpkg.com/three@0.161.0/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "https://unpkg.com/three@0.161.0/examples/jsm/postprocessing/UnrealBloomPass.js";

const canvas = document.getElementById("game");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x04040e);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
camera.position.set(0, 6, -12);

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.8, 0.4, 0.85);
composer.addPass(bloomPass);

const ambientLight = new THREE.AmbientLight(0x4da9ff, 0.45);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.55);
directionalLight.position.set(12, 35, -15);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(2048, 2048);
scene.add(directionalLight);

const neonLight = new THREE.PointLight(0x00ffff, 6, 120, 2);
neonLight.position.set(0, 6, 0);
scene.add(neonLight);

const groundGeometry = new THREE.CircleGeometry(200, 128);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x060616, roughness: 0.9, metalness: 0.1 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.receiveShadow = true;
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

const innerRadius = 18;
const outerRadius = 32;
const trackGeometry = new THREE.RingGeometry(innerRadius, outerRadius, 128, 4);
const trackMaterial = new THREE.MeshStandardMaterial({ color: 0x101032, emissive: 0x0f1c5d, emissiveIntensity: 0.45, side: THREE.DoubleSide });
const track = new THREE.Mesh(trackGeometry, trackMaterial);
track.rotation.x = -Math.PI / 2;
track.receiveShadow = true;
scene.add(track);

const laneMarkGeometry = new THREE.RingGeometry(innerRadius + 0.6, outerRadius - 0.6, 128, 1);
const laneMarkMaterial = new THREE.MeshBasicMaterial({ color: 0x7cf9ff, side: THREE.DoubleSide, transparent: true, opacity: 0.45 });
const laneMarkings = new THREE.Mesh(laneMarkGeometry, laneMarkMaterial);
laneMarkings.rotation.x = -Math.PI / 2;
scene.add(laneMarkings);

const checkpointMaterial = new THREE.MeshStandardMaterial({ color: 0x1321ff, emissive: 0x2f6fff, emissiveIntensity: 1.4, transparent: true, opacity: 0.18 });
const checkpointGeometry = new THREE.CylinderGeometry(0.3, 0.3, 6, 16, 1, true);
const checkpoints = [];
for (let i = 0; i < 6; i++) {
  const angle = (i / 6) * Math.PI * 2;
  const radius = (innerRadius + outerRadius) / 2;
  const mesh = new THREE.Mesh(checkpointGeometry, checkpointMaterial);
  mesh.position.set(Math.sin(angle) * radius, 3, Math.cos(angle) * radius);
  mesh.rotation.y = angle;
  scene.add(mesh);
  checkpoints.push(mesh);
}

function createCar() {
  const group = new THREE.Group();

  const bodyGeometry = new THREE.BoxGeometry(1.8, 0.6, 3.6);
  const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xff3060, metalness: 0.6, roughness: 0.4, emissive: 0x330018, emissiveIntensity: 0.6 });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.castShadow = true;
  body.position.y = 0.6;
  group.add(body);

  const cabinGeometry = new THREE.BoxGeometry(1.4, 0.5, 1.8);
  const cabinMaterial = new THREE.MeshStandardMaterial({ color: 0x0f1d3a, metalness: 0.4, roughness: 0.2, emissive: 0x001f44, emissiveIntensity: 0.8 });
  const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
  cabin.position.set(0, 0.95, -0.2);
  cabin.castShadow = true;
  group.add(cabin);

  const wheelGeometry = new THREE.CylinderGeometry(0.36, 0.36, 0.3, 24);
  const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x050505, metalness: 0.3, roughness: 0.8 });

  const wheelPositions = [
    [-0.9, 0.32, 1.2],
    [0.9, 0.32, 1.2],
    [-0.9, 0.32, -1.2],
    [0.9, 0.32, -1.2],
  ];

  wheelPositions.forEach(([x, y, z]) => {
    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, y, z);
    wheel.castShadow = true;
    group.add(wheel);
  });

  const glowGeometry = new THREE.BoxGeometry(1.6, 0.3, 0.12);
  const glowMaterial = new THREE.MeshBasicMaterial({ color: 0x7cf9ff });
  const rearGlow = new THREE.Mesh(glowGeometry, glowMaterial);
  rearGlow.position.set(0, 0.55, 1.8);
  group.add(rearGlow);

  return group;
}

const car = createCar();
scene.add(car);
car.position.set(0, 0, -outerRadius + 4);
car.rotation.y = Math.PI;

const neonPylons = new THREE.Group();
const pylonGeometry = new THREE.CylinderGeometry(0.5, 0.5, 8, 16, 1, true);
const pylonMaterial = new THREE.MeshStandardMaterial({ color: 0x0c1225, emissive: 0x1261ff, emissiveIntensity: 1.2, transparent: true, opacity: 0.4 });
for (let i = 0; i < 16; i++) {
  const angle = (i / 16) * Math.PI * 2;
  const radius = outerRadius + 6;
  const pylon = new THREE.Mesh(pylonGeometry, pylonMaterial);
  pylon.position.set(Math.sin(angle) * radius, 4, Math.cos(angle) * radius);
  neonPylons.add(pylon);
}
scene.add(neonPylons);

const carState = {
  velocity: 0,
  maxSpeed: 70 / 3.6,
  acceleration: 9,
  braking: 14,
  turnSpeed: 1.8,
};

const controls = {
  forward: false,
  backward: false,
  left: false,
  right: false,
};

const hud = {
  speed: document.getElementById("speed-value"),
  lap: document.getElementById("lap-value"),
  time: document.getElementById("time-value"),
};

let raceStarted = false;
let lapsCompleted = 0;
const totalLaps = 3;
let elapsed = 0;
let previousAngle = Math.atan2(car.position.x, car.position.z);

const clock = new THREE.Clock();

function resetCar() {
  car.position.set(0, 0, -outerRadius + 4);
  car.rotation.set(0, Math.PI, 0);
  carState.velocity = 0;
  raceStarted = false;
  lapsCompleted = 0;
  elapsed = 0;
  previousAngle = Math.atan2(car.position.x, car.position.z);
  hud.lap.textContent = `${lapsCompleted} / ${totalLaps}`;
  hud.time.textContent = `${elapsed.toFixed(1)} s`;
}

function handleKeyDown(event) {
  if (event.repeat) return;
  switch (event.code) {
    case "KeyW":
    case "ArrowUp":
      controls.forward = true;
      break;
    case "KeyS":
    case "ArrowDown":
      controls.backward = true;
      break;
    case "KeyA":
    case "ArrowLeft":
      controls.left = true;
      break;
    case "KeyD":
    case "ArrowRight":
      controls.right = true;
      break;
    case "KeyR":
      resetCar();
      break;
  }
}

function handleKeyUp(event) {
  switch (event.code) {
    case "KeyW":
    case "ArrowUp":
      controls.forward = false;
      break;
    case "KeyS":
    case "ArrowDown":
      controls.backward = false;
      break;
    case "KeyA":
    case "ArrowLeft":
      controls.left = false;
      break;
    case "KeyD":
    case "ArrowRight":
      controls.right = false;
      break;
  }
}

document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function updatePhysics(delta) {
  const { acceleration, braking, maxSpeed } = carState;

  if (controls.forward) {
    carState.velocity += acceleration * delta;
    raceStarted = true;
  } else if (!controls.backward) {
    const drag = Math.sign(carState.velocity) * Math.min(Math.abs(carState.velocity), 6 * delta);
    carState.velocity -= drag;
  }

  if (controls.backward) {
    if (carState.velocity > 0) {
      carState.velocity -= braking * delta;
    } else {
      carState.velocity -= acceleration * 0.6 * delta;
    }
  }

  carState.velocity = clamp(carState.velocity, -maxSpeed * 0.4, maxSpeed);

  const turnFactor = clamp(Math.abs(carState.velocity) / maxSpeed, 0, 1);
  if (controls.left) {
    car.rotation.y += carState.turnSpeed * turnFactor * delta;
  }
  if (controls.right) {
    car.rotation.y -= carState.turnSpeed * turnFactor * delta;
  }

  const direction = new THREE.Vector3(Math.sin(car.rotation.y), 0, Math.cos(car.rotation.y));
  const displacement = direction.multiplyScalar(carState.velocity * delta);
  car.position.add(displacement);

  const flatPosition = new THREE.Vector2(car.position.x, car.position.z);
  const distanceFromCenter = flatPosition.length();

  if (distanceFromCenter > outerRadius - 1.2) {
    const normal = flatPosition.normalize().multiplyScalar(outerRadius - 1.2);
    car.position.set(normal.x, car.position.y, normal.y);
    carState.velocity *= 0.4;
  }

  if (distanceFromCenter < innerRadius + 1.4) {
    const normal = flatPosition.normalize().multiplyScalar(innerRadius + 1.4);
    car.position.set(normal.x, car.position.y, normal.y);
    carState.velocity *= 0.6;
  }
}

function updateCamera() {
  const offset = new THREE.Vector3(0, 6, 12);
  offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), car.rotation.y + Math.PI);
  const targetPosition = new THREE.Vector3().addVectors(car.position, offset);
  camera.position.lerp(targetPosition, 0.12);
  const lookTarget = new THREE.Vector3().copy(car.position);
  lookTarget.y += 1.5;
  camera.lookAt(lookTarget);
}

function updateHud(delta) {
  const speed = Math.max(0, carState.velocity) * 3.6;
  hud.speed.textContent = `${speed.toFixed(0)} km/h`;

  if (raceStarted && lapsCompleted < totalLaps) {
    elapsed += delta;
    hud.time.textContent = `${elapsed.toFixed(1)} s`;
  }

  hud.lap.textContent = `${lapsCompleted} / ${totalLaps}`;
}

function updateLaps() {
  const angle = Math.atan2(car.position.x, car.position.z);
  const threshold = Math.PI / 2;

  if (previousAngle > threshold && angle < -threshold && carState.velocity > 1) {
    lapsCompleted = Math.min(lapsCompleted + 1, totalLaps);
    if (lapsCompleted >= totalLaps) {
      raceStarted = false;
    }
  }

  previousAngle = angle;
}

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  updatePhysics(delta);
  updateLaps();
  updateCamera();
  updateHud(delta);
  composer.render();
}

window.addEventListener("resize", () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  composer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});

resetCar();
animate();
