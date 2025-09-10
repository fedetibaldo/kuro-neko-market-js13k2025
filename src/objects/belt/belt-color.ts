import { drawSvg } from "../../core/draw-svg";
import { GameObject } from "../../core/game-object";
import { Vector, ZERO } from "../../core/vector";
import { fill, fillRect } from "../../utils/draw";
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
		ctx.fillStyle = "#B44141";
		ctx.fillRect(0, 0, this.size.x, this.size.y + 5);

		ctx.strokeStyle = "#3A1141";

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
			ctx.stroke();
		}

		drawSvg(ctx, { path: `M0 ${this.size.y}h${this.size.x}` });
		ctx.stroke();

		ctx.strokeStyle = "#E4B4B4";
		drawSvg(ctx, { path: `M0 0h${this.size.x}` });
		ctx.stroke();
	}
}

export class BeltColor extends GameObject {
	createChildren(): GameObject[] {
		return [
			new BeltBackground({
				size: Vector(this.size.x, 25),
				pos: Vector(0, this.size.y - 10),
			}),
			new BeltMiddleLayer({
				size: Vector(this.size.x, this.size.y - 10),
			}),
		];
	}
}
