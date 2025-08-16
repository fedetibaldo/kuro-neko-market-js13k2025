import { diContainer } from "../core/di-container";
import { drawSvg } from "../core/draw-svg";
import { Game } from "../core/game";
import { GameObject } from "../core/game-object";
import { Input } from "../core/input";
import { Vector } from "../core/vector";

export class CatPaw extends GameObject {
	halfWidth = 22;
	viewBox = new Vector(this.halfWidth, 71);
	faceUp = false;
	game = diContainer.get(Game);
	input = diContainer.get(Input);

	constructor(args = {}) {
		super(args);
		this.input.on("mousedown", this.onMouseDown);
	}

	getCenter() {
		return this.input.mousePos.diff(new Vector(this.halfWidth, 22));
	}

	onMouseDown = () => {
		// if (!this.isAnimating) {
		// this.isAnimating = true;
		const target = this.getCenter().add(Vector.DOWN.mul(10));
		this.faceUp = !this.faceUp;
		// }
	};

	override update(deltaT: number) {
		this.pos = this.getCenter();
		super.update(deltaT);
	}

	override render(ctx: CanvasRenderingContext2D) {
		const viewBox = new Vector(22, 71);
		const drawCalls = [{}, { offsetX: viewBox.x - 1, flipH: true }];
		for (const { offsetX, flipH } of drawCalls) {
			ctx.save();
			ctx.fillStyle = "#19191A";
			if (offsetX) {
				ctx.translate(offsetX, 0);
			}
			drawSvg(ctx, {
				path: "M22 1C12-2 10 5 8 11c-11.5 3-7 11.5-6.5 16 .228 2.049 0 4 .5 6 3.024 12.096 2 28.592 2 38h18V1Z",
				viewBox,
				flipH,
			});
			ctx.fill();
			ctx.restore();
		}
		if (this.faceUp) {
			for (const { offsetX, flipH } of drawCalls) {
				ctx.save();
				if (offsetX) {
					ctx.translate(offsetX, 0);
				}
				ctx.fillStyle = "#E6B9B9";
				drawSvg(ctx, {
					path: "M20 13c0 4.1-1.5 6.5-3.5 6.5-1.9 0-3.5-2.4-3.5-6.5s2.1-8 4-8c2 0 3 3.9 3 8Z",
					viewBox,
					flipH,
				});
				ctx.fill();
				drawSvg(ctx, {
					path: "M11.7 22c.9 2.9-.2 4.4-2 5-1.9.6-3.8-.1-4.7-3-.9-2.9-.5-6.9 1.4-7.5 1.8-.5 4.4 2.6 5.3 5.5Z",
					viewBox,
					flipH,
				});
				ctx.fill();
				drawSvg(ctx, {
					path: "M16 28c2.5-2 3-6 6-6v15c-1.7 0-5.3 2-8 1.5-3.5-.6-5.4-3-4.5-5.5 1.1-3.4 4.2-3.1 6.5-5Z",
					viewBox,
					flipH,
				});
				ctx.fill();
			}
			ctx.restore();
		}
		ctx.fillStyle = "#19191A";
		ctx.fillRect(4, viewBox.y - 1, viewBox.x * 2 - 9, this.game.viewRes.y);

		super.render(ctx);
	}
}
