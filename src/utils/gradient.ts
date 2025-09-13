import { Vector } from "../core/vector";

export const gradient = (
	ctx: OffscreenCanvasRenderingContext2D,
	from: Vector,
	to: Vector,
	stops: [number, string][],
	options?: { flipH?: boolean }
) => {
	const gradient = ctx.createLinearGradient(from.x, from.y, to.x, to.y);
	stops.map(([offset, color]) =>
		gradient.addColorStop(options?.flipH ? 1 - offset : offset, color)
	);
	return gradient;
};
