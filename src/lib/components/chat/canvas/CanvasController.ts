import { CanvasEngine } from './CanvasEngine';

export interface SceneLine {
	id: string;
	type: 'line';
	x1: number;
	y1: number;
	x2: number;
	y2: number;
	color: string;
	width: number;
}

export type SceneObject = SceneLine; // Easily expandable for rect, circle, text, etc.

export class CanvasController {
	private engine: CanvasEngine | null = null;
	private sceneObjects: Map<string, SceneObject> = new Map();

	constructor() {}

	public setEngine(engine: CanvasEngine): void {
		this.engine = engine;
		this.redraw();
	}

	/**
	 * Processes the Svelte store command history to compute the current 
	 * normalized scene graph as the single source of truth.
	 */
	public syncStore(storeElements: any[]): void {
		this.sceneObjects.clear();

		storeElements.forEach((el, index) => {
			const action = el.action;
			const params = el.params || {};
			
			// Object ID is either explicitly passed in params or derived
			const id = params.id || el.id || `line-${index}`;

			if (action === 'draw_line') {
				this.sceneObjects.set(id, {
					id,
					type: 'line',
					x1: params.x1 !== undefined ? Number(params.x1) : 0,
					y1: params.y1 !== undefined ? Number(params.y1) : 0,
					x2: params.x2 !== undefined ? Number(params.x2) : 0,
					y2: params.y2 !== undefined ? Number(params.y2) : 0,
					color: params.color || '#000000',
					width: params.width !== undefined ? Number(params.width) : 2
				});
			} else if (action === 'update_line') {
				const existing = this.sceneObjects.get(id);
				if (existing && existing.type === 'line') {
					this.sceneObjects.set(id, {
						...existing,
						x1: params.x1 !== undefined ? Number(params.x1) : existing.x1,
						y1: params.y1 !== undefined ? Number(params.y1) : existing.y1,
						x2: params.x2 !== undefined ? Number(params.x2) : existing.x2,
						y2: params.y2 !== undefined ? Number(params.y2) : existing.y2,
						color: params.color || existing.color,
						width: params.width !== undefined ? Number(params.width) : existing.width
					});
				}
			} else if (action === 'delete_line') {
				this.sceneObjects.delete(id);
			}
		});

		this.redraw();
	}

	public redraw(): void {
		if (this.engine) {
			this.engine.renderScene(this.getObjects());
		}
	}

	public clear(): void {
		this.sceneObjects.clear();
		if (this.engine) {
			this.engine.clear();
		}
	}

	public getObjects(): SceneObject[] {
		return Array.from(this.sceneObjects.values());
	}
}
