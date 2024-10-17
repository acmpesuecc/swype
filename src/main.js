import Shader from "./Shader";
import Texture from "./Texture";
import { Terrain } from "./Model";
import { glMatrix, mat4, vec3 } from 'gl-matrix';
import { keys, mouseDeltaX, mouseDeltaY, resetMouseDelta, isPointerLocked } from "./Input";

import vertexShaderSource from "./shaders/vert.glsl";
import fragmentShaderSource from "./shaders/frag.glsl";

const canvas = document.querySelector("#glcanvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const resolution = [canvas.width, canvas.height];

const gl = WebGLDebugUtils.makeDebugContext(canvas.getContext("webgl2"));

if (gl === null) {
    alert("Unable to initialize WebGL.");
} else {
    // SHADER
    const vert = Shader.compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
    const frag = Shader.compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);

    const globalShader = new Shader(gl);
    globalShader.createShaders(vert, frag);

    // DATA
    const model = new Terrain(gl,10);
    model.setup();

    gl.useProgram(globalShader.program);

    // UNIFORMS
    const uSamplerLocation = gl.getUniformLocation(globalShader.program, "uSampler");
    gl.uniform1i(uSamplerLocation, 0);

    const startTime = performance.now();
    let currentTime, elapsedTime;
    const uTimeLocation = gl.getUniformLocation(globalShader.program, "uTime");
    const uResolutionLocation = gl.getUniformLocation(globalShader.program, "uResolution");

    const uPMLocation = gl.getUniformLocation(globalShader.program, "uPM");
    const uMVMLocation = gl.getUniformLocation(globalShader.program, "uMVM");

    const fieldOfView = (45 * Math.PI) / 180;
    const aspect = resolution[0] / resolution[1];
    const zNear = 0.1;
    const zFar = 300.0;
    const projectionMatrix = mat4.create();

    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
    const modelViewMatrix = mat4.create();

    let cameraUp = vec3.fromValues(0.0, 1.0, 0.0);
    let cameraFront = vec3.fromValues(0.0, 0.0, 1.0);
    let cameraPosition = vec3.fromValues(0.0, 0, 0.0);
    const movementSpeed = 0.1;

	let yaw = 45;
	let pitch = 0;
	const rotationSpeed = 0.5;
	const mouseSensitivity = 0.05;

    gl.uniformMatrix4fv(uPMLocation, false, projectionMatrix);
    gl.uniformMatrix4fv(uMVMLocation, false, modelViewMatrix);
    gl.uniform2fv(uResolutionLocation, resolution);

    gl.clearColor(0, 0, 0, 1);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    function updateCamera() {
        const front = vec3.create();
		const up = vec3.create();
		const right = vec3.create();

        vec3.copy(front, cameraFront);
		vec3.copy(up, cameraUp);
		vec3.cross(right, front, up);

        if (keys[87]) vec3.scaleAndAdd(cameraPosition, cameraPosition, front, movementSpeed);
        if (keys[83]) vec3.scaleAndAdd(cameraPosition, cameraPosition, front, -movementSpeed);
        if (keys[68]) vec3.scaleAndAdd(cameraPosition, cameraPosition, right, movementSpeed);
        if (keys[65]) vec3.scaleAndAdd(cameraPosition, cameraPosition, right, -movementSpeed);
        if (keys[32]) vec3.scaleAndAdd(cameraPosition, cameraPosition, up, movementSpeed);
        if (keys[16]) vec3.scaleAndAdd(cameraPosition, cameraPosition, up, -movementSpeed);

        if (isPointerLocked) {
            yaw += mouseDeltaX * mouseSensitivity;
            pitch -= mouseDeltaY * mouseSensitivity;

            pitch = Math.max(-89, Math.min(89, pitch));

            const frontX = Math.cos(glMatrix.toRadian(yaw)) * Math.cos(glMatrix.toRadian(pitch));
            const frontY = Math.sin(glMatrix.toRadian(pitch));
            const frontZ = Math.sin(glMatrix.toRadian(yaw)) * Math.cos(glMatrix.toRadian(pitch));
            vec3.set(cameraFront, frontX, frontY, frontZ);
            vec3.normalize(cameraFront, cameraFront);
        }

        resetMouseDelta();

        const viewMatrix = mat4.create();
        mat4.lookAt(viewMatrix, cameraPosition, vec3.add(vec3.create(), cameraPosition, cameraFront), cameraUp);
        gl.uniformMatrix4fv(uMVMLocation, false, viewMatrix);
    }

    function renderLoop() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        currentTime = performance.now();
        elapsedTime = (currentTime - startTime) / 1000;
        gl.uniform1f(uTimeLocation, elapsedTime);

        updateCamera();
        model.render();

        requestAnimationFrame(renderLoop);
    }

    renderLoop();
}
