import { ONE, Vector } from "../core/vector";

export const fillRoundRect = (
	ctx: OffscreenCanvasRenderingContext2D,
	from: Vector,
	to: Vector,
	radius: number,
	fillStyle?: string | CanvasGradient | CanvasPattern
) => {
	ctx.beginPath();
	ctx.roundRect(from.x, from.y, to.x, to.y, radius);
	fill(ctx, fillStyle);
};

export const fillRect = (
	ctx: OffscreenCanvasRenderingContext2D,
	from: Vector,
	to: Vector,
	fillStyle?: string | CanvasGradient | CanvasPattern
) => {
	ctx.beginPath();
	ctx.rect(from.x, from.y, to.x, to.y);
	fill(ctx, fillStyle);
};

export const traceCircle = (
	ctx: OffscreenCanvasRenderingContext2D,
	pos: Vector,
	radius: number
) => {
	ctx.beginPath();
	const { x, y } = pos.add(ONE.mul(radius));
	ctx.arc(x, y, radius, 0, Math.PI * 2, true);
};

export const stroke = (
	ctx: OffscreenCanvasRenderingContext2D,
	strokeStyle?: string | CanvasGradient | CanvasPattern,
	lineWidth?: number
) => {
	ctx.lineCap = "round";
	ctx.lineJoin = "round";
	lineWidth && (ctx.lineWidth = lineWidth);
	strokeStyle && (ctx.strokeStyle = strokeStyle);
	ctx.stroke();
};

export const fill = (
	ctx: OffscreenCanvasRenderingContext2D,
	fillStyle?: string | CanvasGradient | CanvasPattern
) => {
	fillStyle && (ctx.fillStyle = fillStyle);
	ctx.fill();
};

export const fillCircle = (
	ctx: OffscreenCanvasRenderingContext2D,
	pos: Vector,
	radius: number,
	fillStyle?: string | CanvasGradient | CanvasPattern
) => {
	traceCircle(ctx, pos, radius);
	fill(ctx, fillStyle);
};
