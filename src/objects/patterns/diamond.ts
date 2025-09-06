import { drawSvg } from "../../core/draw-svg";
import { GameObject } from "../../core/game-object";
import { unique } from "../../core/unique";
import { ONE, Vector, ZERO } from "../../core/vector";
import { Viewport } from "../../core/viewport";
import { fill, fillRect } from "../../utils/draw";

export const DIAMOND_ID = unique();

export class Diamond extends GameObject {
	render(ctx: OffscreenCanvasRenderingContext2D): void {
		fillRect(ctx, ZERO, ONE.mul(16), "#E5A366");
		drawSvg(ctx, { path: "M8 0 0 8l8 8 8-8-8-8Z" });
		fill(ctx, "#DB9657");
	}
}

export const diamondPattern = new Viewport({
	id: DIAMOND_ID,
	size: Vector(16, 16),
	children: [new Diamond()],
});
