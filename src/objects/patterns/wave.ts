import { drawSvg } from "../../core/draw-svg";
import { GameObject } from "../../core/game-object";
import { unique } from "../../core/unique";
import { ONE, Vector, ZERO } from "../../core/vector";
import { Viewport } from "../../core/viewport";
import { fillRect, stroke } from "../../utils/draw";

export const WAVE_ID = unique();

class Wave extends GameObject {
	render(ctx: OffscreenCanvasRenderingContext2D): void {
		fillRect(ctx, ZERO, ONE.mul(16), "#9C5FA7");
		drawSvg(ctx, {
			path: "M0 16s0-4 2-6 6-2 6-2 4 0 6-2 2-6 2-6m0 16s0-4 2-6M-2 6c2-2 2-6 2-6",
		});
		stroke(ctx, "#AD64BA", 3);
	}
}

export const wavePattern = new Viewport({
	id: WAVE_ID,
	size: Vector(16, 16),
	children: [new Wave()],
});
