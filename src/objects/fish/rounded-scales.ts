import { drawSvg } from "../../core/draw-svg";
import { GameObject } from "../../core/game-object";
import { Vector } from "../../core/vector";

export class RoundedScales extends GameObject {
	constructor(args = {}) {
		super(args);
		this.size = new Vector(16, 16);
	}

	render(ctx: CanvasRenderingContext2D) {
		// ctx.fillStyle = "red";
		// ctx.fillRect(0, 0, this.size.x, this.size.y);
		ctx.strokeStyle = "black";
		ctx.lineWidth = 1;
		drawSvg(ctx, {
			path: "M16 12c-3 0-4-4-4-4s-1 4-4 4-4-4-4-4-1 4-4 4M0 0s1 4 4 4 4-4 4-4 1 4 4 4 4-4 4-4",
		});
		ctx.stroke();
	}
}
