import { drawSvg } from "../../core/draw-svg";
import { GameObject } from "../../core/game-object";
import { unique } from "../../core/unique";
import { Vector } from "../../core/vector";
import { Viewport } from "../../core/viewport";
import { fill } from "../../utils/draw";
import { gradient } from "../../utils/gradient";

export const WOOD_ID = unique();

class Wood extends GameObject {
	shadeDarkViewBox = Vector(9, 13);
	shadeLightViewBox = Vector(14, 11);
	shadeDarkPath = "M0 13c3.9 0 9-3 9-6.5C9 2.9 3.9 0 0 0v13Z";
	shadeLightPath = "M0 11c7.7 0 14-2.5 14-5.5S7.7 0 0 0v11Z";

	shadeDarkGradient = (
		ctx: OffscreenCanvasRenderingContext2D,
		flipH = false
	) => {
		const gradient = ctx.createLinearGradient(0, 0, this.shadeDarkViewBox.x, 0);
		gradient.addColorStop(flipH ? 1 : 0, "#A3683C");
		gradient.addColorStop(flipH ? 0 : 1, "#956037");
		return gradient;
	};

	shadeLightGradient = (
		ctx: OffscreenCanvasRenderingContext2D,
		flipH = false
	) => {
		const gradient = ctx.createLinearGradient(
			0,
			0,
			this.shadeLightViewBox.x,
			0
		);
		gradient.addColorStop(flipH ? 1 : 0, "#A3683C");
		gradient.addColorStop(flipH ? 0 : 1, "#B37342");
		return gradient;
	};
	shadeDarkPos: { pos: Vector; flipH?: boolean }[] = [
		{ pos: Vector(21, -5), flipH: true },
		{ pos: Vector(34, 10), flipH: true },
		{ pos: Vector(10, 20) },
		{ pos: Vector(23, 36) },
		{ pos: Vector(7, 43), flipH: true },
		{ pos: Vector(21, 55), flipH: true },
	];
	shadeLightPos: { pos: Vector; flipH?: boolean }[] = [
		{ pos: Vector(1, 0) },
		{ pos: Vector(17, 10) },
		{ pos: Vector(45, 22) },
		{ pos: Vector(-10, 38) },
		{ pos: Vector(50, 38) },
		{ pos: Vector(35, 32) },
	];

	constructor(args = {}) {
		super(args);
		this.size = Vector(60, 60);
	}

	render(ctx: OffscreenCanvasRenderingContext2D) {
		ctx.fillStyle = "#A3683C";
		ctx.fillRect(0, 0, this.size.x, this.size.y);

		const shades = [
			{
				gradient: this.shadeDarkGradient,
				positions: this.shadeDarkPos,
				viewBox: this.shadeDarkViewBox,
				path: this.shadeDarkPath,
			},
			{
				gradient: this.shadeLightGradient,
				positions: this.shadeLightPos,
				viewBox: this.shadeLightViewBox,
				path: this.shadeLightPath,
			},
		];

		for (const { gradient, positions, viewBox, path } of shades) {
			for (const { pos, flipH } of positions) {
				ctx.save();
				ctx.translate(pos.x, pos.y);
				drawSvg(ctx, { path, viewBox, flipH });
				fill(ctx, gradient(ctx, flipH));
				ctx.restore();
			}
		}

		const linePosY = [10.5, 32.5, 54.5];
		ctx.strokeStyle = "#3B2616";
		ctx.lineWidth = 2;
		for (const y of linePosY) {
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(this.size.x, y);
			ctx.stroke();
		}

		const veins = [
			{
				gradient: gradient(ctx, Vector(0, 0), Vector(14, 0), [
					[0, "#956037"],
					[1, "#A3683C"],
				]),
				path: "M0 17c3 0 5 .5 7.5 0 2.6-.5 4-1.5 6.5-1.5",
			},
			{
				gradient: gradient(ctx, Vector(0, 0), Vector(60, 0), [
					[0, "#684327"],
					[1, "#956037"],
				]),
				path: "M0 21c4.5 0 7.3-1.6 12-1.5 3.1 0 4.9 1 8 1 3.5 0 5.5-.9 9-1 4.7-.1 7.3.9 12 1 7.4.2 11.5-3.5 19-3.5",
			},
			{
				gradient: gradient(ctx, Vector(19, 0), Vector(60, 0), [
					[0, "#956037"],
					[0.5, "#5B3727"],
					[1, "#684327"],
				]),
				path: "M60 21c-2 0-7 .6-8.5 1-4 1-15.5 1.7-19 2-6 .5-11 3-15 3",
			},
			{
				gradient: gradient(ctx, Vector(13, 0), Vector(48, 0), [
					[0, "#956037"],
					[0.5, "#764D2D"],
					[1, "#A3683C"],
				]),
				path: "M13 47.5c4.5-.5 7-2 11.5-3 5.2-1 8.3-1 13.5-2 4-.8 6-2 10-2.5",
			},
			{
				gradient: gradient(ctx, Vector(0, 0), Vector(16, 0), [
					[0, "#684327"],
					[1, "#956037"],
				]),
				path: "M0 47c6.5 0 10.5-3 16.5-4",
			},
			{
				gradient: gradient(ctx, Vector(36, 0), Vector(60, 0), [
					[0, "#956037"],
					[1, "#684327"],
				]),
				path: "M37.5 48c9-1 19-1 22.5-1",
			},
		];

		for (const { gradient, path } of veins) {
			ctx.strokeStyle = gradient;
			ctx.lineWidth = 2;
			drawSvg(ctx, { path });
			ctx.stroke();
		}
	}
}

export const woodPattern = new Viewport({
	id: WOOD_ID,
	size: Vector(60, 60),
	children: [new Wood()],
});
