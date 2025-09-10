import { LEFT, Vector } from "../../core/vector";
import { clamp } from "../../utils/clamp";
import { drawSvg } from "../../core/draw-svg";
import { stroke } from "../../utils/draw";
import { Particle } from "../../systems/particle/particle";

export class Ray extends Particle {
	origin = LEFT;
	_color = "#EEAA67";
	size = Vector(16, 3);
	render(ctx: OffscreenCanvasRenderingContext2D): void {
		const offset = (this._progress * this.size.x) / 2;
		const A = clamp(this._progress * 2 - 1, 0, 1) * this.size.x;
		const B = clamp(this._progress * 2, 0, 1) * this.size.x;
		drawSvg(ctx, {
			path: `M${offset + B} ${this.size.y / 2}L${offset + A} ${
				this.size.y / 2
			}`,
		});
		stroke(ctx, this._color, this.size.y);
	}
}
