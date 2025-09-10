import { drawSvg } from "../../core/draw-svg";
import { GameObject } from "../../core/game-object";
import { unique } from "../../core/unique";
import { TOP_LEFT, Vector, ZERO } from "../../core/vector";
import { Viewport } from "../../core/viewport";
import { fill, fillRect, stroke } from "../../utils/draw";
import { gradient } from "../../utils/gradient";

export const WOOD_ID = unique();

const shadeDarkViewBox = Vector(9, 13);
const shadeLightViewBox = Vector(14, 11);
const shadeDarkPath = "M0 13c3.9 0 9-3 9-6.5C9 2.9 3.9 0 0 0v13Z";
const shadeLightPath = "M0 11c7.7 0 14-2.5 14-5.5S7.7 0 0 0v11Z";

const shadeDarkGradient = (
	ctx: OffscreenCanvasRenderingContext2D,
	flipH = false
) =>
	gradient(ctx, ZERO, shadeDarkViewBox.mulv(TOP_LEFT), [
		[0, flipH ? "#956037" : "#A3683C"],
		[1, flipH ? "#A3683C" : "#956037"],
	]);

const shadeLightGradient = (
	ctx: OffscreenCanvasRenderingContext2D,
	flipH = false
) =>
	gradient(ctx, ZERO, shadeLightViewBox.mulv(TOP_LEFT), [
		[0, flipH ? "#B37342" : "#A3683C"],
		[1, flipH ? "#A3683C" : "#B37342"],
	]);

const shadeDarkPos: ([Vector, boolean] | [Vector])[] = [
	[Vector(21, -5), true],
	[Vector(34, 10), true],
	[Vector(10, 20)],
	[Vector(23, 36)],
	[Vector(7, 43), true],
	[Vector(21, 55), true],
];
const shadeLightPos: ([Vector, boolean] | [Vector])[] = [
	[Vector(1, 0)],
	[Vector(17, 10)],
	[Vector(45, 22)],
	[Vector(-10, 38)],
	[Vector(50, 38)],
	[Vector(35, 32)],
];

class Wood extends GameObject {
	constructor(args = {}) {
		super(args);
		this.size = Vector(60, 60);
	}

	render(ctx: OffscreenCanvasRenderingContext2D) {
		fillRect(ctx, ZERO, this.size, "#A3683C");

		const shades = [
			{
				gradient: shadeDarkGradient,
				positions: shadeDarkPos,
				viewBox: shadeDarkViewBox,
				path: shadeDarkPath,
			},
			{
				gradient: shadeLightGradient,
				positions: shadeLightPos,
				viewBox: shadeLightViewBox,
				path: shadeLightPath,
			},
		];

		shades.map(({ gradient, positions, viewBox, path }) =>
			positions.map(([pos, flipH]) => {
				ctx.save();
				ctx.translate(pos.x, pos.y);
				drawSvg(ctx, { path, viewBox, flipH });
				fill(ctx, gradient(ctx, flipH));
				ctx.restore();
			})
		);

		const linePosY = [10.5, 32.5, 54.5];
		linePosY.map((y) => {
			drawSvg(ctx, { path: `M0 ${y}L${this.size.x} ${y}` });
			stroke(ctx, "#3B2616", 2);
		});

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

		veins.map(({ gradient, path }) => {
			drawSvg(ctx, { path });
			stroke(ctx, gradient, 2);
		});
	}
}

export const woodPattern = new Viewport({
	id: WOOD_ID,
	size: Vector(60, 60),
	children: [new Wood()],
});
