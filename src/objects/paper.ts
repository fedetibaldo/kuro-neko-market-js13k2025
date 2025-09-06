import { drawSvg } from "../core/draw-svg";
import { Flexbox } from "../core/flexbox";
import { CENTER, Vector, ZERO } from "../core/vector";
import { PickupableInterface } from "../systems/interactable/interactable.types";
import { fill } from "../utils/draw";
import { gradient } from "../utils/gradient";

export class Paper extends Flexbox implements PickupableInterface {
	canBePickedUp = false;
	baseLayer = 0.75;
	size = Vector(24, 24);
	center = this.size.mul(1 / 2);
	origin = CENTER;
	direction = "row" as const;
	align = "center" as const;
	justify = "center" as const;
	spaceBetween = 0;
	value = 0;

	isHeld = false;
	pickup(): void {
		this.isHeld = true;
	}
	drop(): void {
		this.isHeld = false;
	}

	render(ctx: OffscreenCanvasRenderingContext2D): void {
		if (!this.isHeld) {
			drawSvg(ctx, {
				path: "M2 6 0 2V0h22l2 4v2l-2 4 2 2v2l-2 4 2 2v2l-2 4H0v-2l2-2-2-4v-2l2-2-2-4V8l2-2Z",
			});
			fill(ctx, "#00000088");
		}
		drawSvg(ctx, {
			path: "M22 0H0l2 4-2 4 2 4-2 4 2 4-2 4h22l2-4-2-4 2-4-2-4 2-4-2-4Z",
		});
		fill(
			ctx,
			gradient(ctx, ZERO, Vector(0, this.size.y), [
				[0, "#F9F4F0"],
				[1, "#F3EAE2"],
			])
		);
	}
}
