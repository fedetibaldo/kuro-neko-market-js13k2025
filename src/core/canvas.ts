import { GameObject } from "./game-object";
import { Vector } from "./vector";

export class Canvas extends GameObject {
	canvas: OffscreenCanvas;
	debug: boolean;
	ctx: OffscreenCanvasRenderingContext2D;

	constructor({ size = new Vector(), debug = false, ...rest }) {
		super(rest);
		this.size = size;
		this.canvas = new OffscreenCanvas(this.size.x, this.size.y);
		this.debug = debug;
		this.ctx = this.canvas.getContext("2d")!;
		// this.ctx.imageSmoothingEnabled = false;
	}

	override render(ctx: CanvasRenderingContext2D) {
		this.children.forEach((child) => {
			child.render(this.ctx);
		});
		if (this.debug) {
			ctx.drawImage(this.canvas, 0, 0);
		}
	}

	override getGlobalOpacity() {
		return this.opacity;
	}

	override getGlobalPosition() {
		return this.pos;
	}
}
