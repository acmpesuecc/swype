import * as THREE from 'three'; // If you're using Three.js

let camera, scene, renderer;
let yawObject, pitchObject;
let isPointerLocked = false;
let mouseSensitivity = 0.002;
let maxPitch = Math.PI / 2 - 0.1;  // Pitch constraint to avoid camera flipping
let minPitch = -Math.PI / 2 + 0.1;
let prevTime = performance.now();

function init() {
  // Initialize scene, camera, and renderer
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

  // Create yaw and pitch controls
  yawObject = new THREE.Object3D();
  pitchObject = new THREE.Object3D();
  yawObject.add(pitchObject);
  pitchObject.add(camera);

  // Initial camera position
  camera.position.z = 5;

  // Create renderer
  renderer = new THREE.WebGLRenderer({ canvas: document.querySelector("#glcanvas") });
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Handle pointer lock
  document.body.addEventListener('click', () => {
    document.body.requestPointerLock();
  });

  // Pointer lock change handler
  document.addEventListener('pointerlockchange', () => {
    isPointerLocked = document.pointerLockElement === document.body;
  });

  // Handle mouse move event
  document.addEventListener('mousemove', onMouseMove);

  // Window resize handler
  window.addEventListener('resize', onWindowResize);

  // Add a basic cube to the scene for reference
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  // Render loop
  animate();
}

function onMouseMove(event) {
  if (!isPointerLocked) return; // Do nothing if pointer lock isn't active

  // Get mouse movement deltas
  const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
  const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

  // Apply yaw (horizontal rotation)
  yawObject.rotation.y -= movementX * mouseSensitivity;

  // Apply pitch (vertical rotation), but clamp it to avoid flipping
  pitchObject.rotation.x -= movementY * mouseSensitivity;
  pitchObject.rotation.x = Math.max(minPitch, Math.min(maxPitch, pitchObject.rotation.x)); // Clamp pitch
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  const time = performance.now();
  const deltaTime = (time - prevTime) / 1000;
  prevTime = time;

  // Update any necessary logic here
  renderer.render(scene, camera);
}

init();