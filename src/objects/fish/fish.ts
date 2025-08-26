import { Viewport } from "../../core/viewport";
import { drawSvg } from "../../core/draw-svg";
import { GameObject } from "../../core/game-object";
import { Vector } from "../../core/vector";
import { createLinearGradient } from "../../utils/create-linear-gradient";
import { FishEye } from "./fish-eye";
import { RoundedScales } from "./rounded-scales";
import { PickupableInterface } from "../../systems/interactable/interactable.types";

export class Fish extends GameObject implements PickupableInterface {
	graphic: FishGraphic;
	size = new Vector(40, 80);

	constructor({ flipH = false, ...rest }) {
		super(rest);
		this.graphic = new FishGraphic({ flipH });
		this.addChildren([this.graphic]);
	}
	baseLayer = 0.75;
	readonly canBePickedUp = true;
	origin = Vector.CENTER;
	center = this.size.mul(1 / 2);

	pickup(): void {
		this.graphic.isShadowHidden = true;
	}
	drop(): void {
		this.graphic.isShadowHidden = false;
	}
}

class FishGraphic extends GameObject {
	texture: Viewport;
	size = new Vector(40, 80);
	origin = Vector.CENTER;
	center = this.size.mul(1 / 2);

	isShadowHidden = false;
	flipH: boolean;

	constructor({ flipH = false, ...rest }) {
		super(rest);
		this.flipH = flipH;
		this.texture = new Viewport({
			size: new Vector(16, 16),
			children: [
				new RoundedScales({
					id: "texture",
				}),
			],
		});
		let eyePos = this.flipH ? new Vector(23 - 8, 7) : new Vector(17, 7);
		this.addChildren([this.texture, new FishEye({ pos: eyePos })]);
	}

	update(deltaT: number) {
		// if (typeof this.ogScale == "undefined") {
		// 	this.ogScale = this.scale;
		// }
		// this.scale = this.ogScale - 0.5 * Math.abs(Math.sin(Game.oldT / 1000));
		// this.rotation += delta / 1000;
	}

	render(ctx: OffscreenCanvasRenderingContext2D) {
		if (!this.isShadowHidden) {
			drawSvg(ctx, {
				path: "M20.5 64.5 18.1.3C2-1.5-4.5 32 15.5 62L12 77.5l1.8 1.9L18 74l9.2 2.9-6.7-12.4Z",
				viewBox: this.size,
				flipH: this.flipH,
			});
			ctx.fillStyle = "#00000044";
			ctx.fill();
		}
		drawSvg(ctx, {
			path: "m13.8 79.4 5.3-15 3 .6 5 11.9-6.5-5-6.9 7.5Z",
			viewBox: this.size,
			flipH: this.flipH,
		});
		ctx.fillStyle = "#4e7dac";
		ctx.fill();
		drawSvg(ctx, {
			path: "M19 64.4C9.8 42.8 8.5 5.6 18.2.4c15 13.7 14.7 48 4 64.6l-3-.6Z",
			viewBox: this.size,
			flipH: this.flipH,
		});
		const gradient = createLinearGradient(
			ctx,
			Vector.ZERO,
			new Vector(this.size.x, 0),
			[
				[0, "#FFFFFF"],
				[1, "#4a86f5"],
			],
			{ flipH: this.flipH }
		);
		ctx.fillStyle = gradient;
		ctx.fill();
		const pattern = ctx.createPattern(this.texture.canvas, "repeat");
		ctx.fillStyle = pattern!;
		ctx.fill();
		drawSvg(ctx, {
			path: "m19 64.4 1.2.2m2 .4-1-.2m-1-.2-1.4 7m1.4-7 1 .2m0 0 1.3 5.8",
			viewBox: this.size,
			flipH: this.flipH,
		});
		ctx.lineCap = "round";
		ctx.stroke();
		// ctx.lineWidth = 4;
		// ctx.lineCap = "round";
		// ctx.lineJoin = "bevel";
		// ctx.strokeStyle = "white";
		// ctx.stroke();
	}
}
