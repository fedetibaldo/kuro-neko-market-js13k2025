import { drawSvg } from "../../core/draw-svg";
import { GameObject, GameObjectArgs } from "../../core/game-object";
import { Vector, ZERO } from "../../core/vector";
import { fill, fillRect, stroke } from "../../utils/draw";
import { gradient } from "../../utils/gradient";
import { range } from "../../utils/range";

class BeltBackground extends GameObject {
	render(ctx: OffscreenCanvasRenderingContext2D) {
		fillRect(
			ctx,
			ZERO,
			this.size,
			gradient(ctx, Vector(0, 0), Vector(0, this.size.y / 2), [
				[0, "#282828"],
				[1, "#5B5B5B"],
			])
		);
		const radius = this.size.y / 2;
		range(5).map((idx) => {
			ctx.beginPath();
			ctx.arc(
				(this.size.x / 4) * idx,
				this.size.y / 2,
				radius,
				0,
				Math.PI * 2,
				true
			);
			fill(ctx, "#807D7D");
		});
	}
}

class BeltMiddleLayer extends GameObject {
	offsetX = 0;
	velocity = 30;

	update(deltaT: number) {
		this.offsetX += (this.velocity * deltaT) / 1000;
	}

	render(ctx: OffscreenCanvasRenderingContext2D): void {
		fillRect(ctx, ZERO, Vector(this.size.x, this.size.y + 5), "#B44141");

		const lineAmount = 14;
		for (const idx of range(lineAmount)) {
			const gap = 45;
			const width = gap * lineAmount;
			const start = (width - this.size.x) / 2;
			drawSvg(ctx, {
				path: `M${(((this.offsetX + gap * idx) % width) - start).toFixed(2)} ${
					this.size.y + 5
				}v-5L${this.size.x / 2} -70`,
			});
			stroke(ctx, "#3A1141");
		}

		drawSvg(ctx, { path: `M0 ${this.size.y}h${this.size.x}` });
		stroke(ctx);

		drawSvg(ctx, { path: `M0 0h${this.size.x}` });
		stroke(ctx, "#E4B4B4");
	}
}

export class BeltColor extends GameObject {
	constructor(args: GameObjectArgs) {
		super(args);
		this.addChildren([
			new BeltBackground({
				size: Vector(this.size.x, 25),
				pos: Vector(0, this.size.y - 10),
			}),
			new BeltMiddleLayer({
				size: Vector(this.size.x, this.size.y - 10),
			}),
		]);
	}
}
