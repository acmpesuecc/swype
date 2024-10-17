import Noise from 'noise-ts';

const gaussian = (x,y,sigma) => {	
	return Math.exp(-(x*x+y*y)/(2*sigma*sigma));
}

export default class Model {
	constructor(gl) {
		this.gl = gl;
		this.vbo = null;
		this.vao = null;
	}

	static createBuffer(gl, data, usage) {
		const buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, data, usage);
		return buffer;
	}

	static createVertexArray(gl) {
		const vao = gl.createVertexArray();
		gl.bindVertexArray(vao);
		return vao;
	}
}

export class Terrain extends Model {
	constructor(gl, size) {
		super(gl);
		this.size = size;
		this.granularity = 100;
		this.noiseScale = 0.1;
		this.heightScale = 1.0;
		this.noise = new Noise(Math.random());
		this.gaussianSigma = this.size / 4;
		this.useMinecraftColors = false;
	}

	setup() {
		const hsize = Math.floor(this.size / 2);
		const step = 1 / this.granularity;

		const vertices = [];
		const indices = [];

		for (let z = -hsize; z < hsize; z += step) {
			for (let x = -hsize; x < hsize; x += step) {
				const height = this.getHeight(x, z);
				const color = this.getColor(height);
				vertices.push(x, height, z, ...color);
			}
		}

		this.vao = this.gl.createVertexArray();
		this.gl.bindVertexArray(this.vao);

		const buffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);

		this.gl.enableVertexAttribArray(0);
		this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, 24, 0);

		this.gl.enableVertexAttribArray(1);
		this.gl.vertexAttribPointer(1, 3, this.gl.FLOAT, false, 24, 12);

		this.vertexCount = vertices.length / 6;
	}

	getHeight(x, z) {
		const baseHeight = this.noise.perlin2(x*0.5, z*0.5)*gaussian(x,z,2);
		const detailNoise = this.noise.perlin2(x, z) * gaussian(x,z,3);
		return (baseHeight + detailNoise) * this.heightScale;
	}

	getColor(height) {
		const normalizedHeight = (height + this.heightScale) / (2 * this.heightScale);
		
		if (this.useMinecraftColors) {
			if (normalizedHeight < 0.3) return [0.0, 0.0, 0.5];      
			if (normalizedHeight < 0.4) return [0.0, 0.0, 1.0];      
			if (normalizedHeight < 0.5) return [0.76, 0.7, 0.5];     
			if (normalizedHeight < 0.7) return [0.0, 0.5, 0.0];      
			if (normalizedHeight < 0.8) return [0.5, 0.5, 0.5];      
			return [1.0, 1.0, 1.0];                                  
		} else {
			if (normalizedHeight < 0.3) return [0.1, 0.0, 0.3];     
			if (normalizedHeight < 0.4) return [0.5, 0.0, 0.5];      
			if (normalizedHeight < 0.55) return [0.2, 0.0, 0.5];     
			if (normalizedHeight < 0.6) return [0.9, 0.0, 0.4];      
			if (normalizedHeight < 0.7) return [1.0, 0.4, 0.0];      
			return [1.0, 0.9, 0.0];                                  
		}
	}

	render() {
		this.gl.bindVertexArray(this.vao);
		this.gl.drawArrays(this.gl.POINTS, 0, this.vertexCount);
	}
}