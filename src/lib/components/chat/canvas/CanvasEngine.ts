import type { SceneObject } from './CanvasController';

export class CanvasEngine {
	private ctx: CanvasRenderingContext2D;
	private canvas: HTMLCanvasElement;

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		const context = canvas.getContext('2d');
		if (!context) {
			throw new Error('Could not get 2D rendering context');
		}
		this.ctx = context;
	}

	public clear(): void {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	public draw(object: SceneObject): void {
		if (object.type === 'line') {
			this.ctx.beginPath();
			this.ctx.moveTo(Number(object.x1), Number(object.y1));
			this.ctx.lineTo(Number(object.x2), Number(object.y2));
			this.ctx.strokeStyle = object.color || '#000000';
			this.ctx.lineWidth = object.width || 2;
			this.ctx.stroke();
		}
	}

	public renderScene(objects: SceneObject[]): void {
		this.clear();
		for (const obj of objects) {
			this.draw(obj);
		}
	}
}
