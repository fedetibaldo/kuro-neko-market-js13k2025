import { NewOmit } from "../utils/new-omit";
import { GameObject, GameObjectArgs } from "./game-object";
import { RendererInterface } from "./render.types";
import { Vector } from "./vector";

export type ViewportArgs = NewOmit<GameObjectArgs, "size"> & {
	size: Vector;
};

export class Viewport extends GameObject implements RendererInterface {
	canvas: OffscreenCanvas;
	ctx: OffscreenCanvasRenderingContext2D;

	constructor(args: ViewportArgs) {
		super(args);
		this.canvas = new OffscreenCanvas(this.size.x, this.size.y);
		this.ctx = this.canvas.getContext("2d")!;
		// this.ctx.imageSmoothingEnabled = false;
	}

	override getGlobalPosition() {
		return this.pos;
	}
}
