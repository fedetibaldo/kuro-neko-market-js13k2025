import { Vector } from "../core/vector";

export function createLinearGradient(
	ctx: CanvasRenderingContext2D,
	from: Vector,
	to: Vector,
	stops: [number, string][]
) {
	const gradient = ctx.createLinearGradient(from.x, from.y, to.x, to.y);
	for (const [offset, color] of stops) {
		gradient.addColorStop(offset, color);
	}
	return gradient;
}
