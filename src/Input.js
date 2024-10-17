const canvas = document.querySelector("#glcanvas");

const keys = {};

let mouseDeltaX = 0;
let mouseDeltaY = 0;
let isPointerLocked = false;

function handleKeyDown(event) {
	keys[event.keyCode] = true;
}

function handleKeyUp(event) {
	keys[event.keyCode] = false;
}

function handleMouseMove(event) {
	if (isPointerLocked) {
		mouseDeltaX += event.movementX;
		mouseDeltaY += event.movementY;
	}
}

function resetMouseDelta() {
	mouseDeltaX = 0;
	mouseDeltaY = 0;
}

function handlePointerLockChange() {
	isPointerLocked = document.pointerLockElement === canvas;
}

function handleCanvasClick() {
	if (!isPointerLocked) {
		canvas.requestPointerLock();
	}
}

document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);
document.addEventListener("mousemove", handleMouseMove);
document.addEventListener('pointerlockchange', handlePointerLockChange);
document.addEventListener('click', handleCanvasClick);

export { keys, mouseDeltaX, mouseDeltaY, resetMouseDelta, isPointerLocked };
