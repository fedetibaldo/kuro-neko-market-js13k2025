import { LEFT, Vector } from "../../core/vector";
import { drawSvg } from "../../core/draw-svg";
import { stroke } from "../../utils/draw";
import { Particle } from "../../systems/particle/particle";

export class Cross extends Particle {
	origin = LEFT;
	size = Vector(9, 9);
	render(ctx: OffscreenCanvasRenderingContext2D): void {
		ctx.translate(this._progress * 16, 0);
		drawSvg(ctx, {
			path: `M0 0L9 9M0 9L9 0`,
		});
		stroke(ctx, "#581D41", 4);
	}
}
