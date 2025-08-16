import { Canvas } from "../../core/canvas";
import { drawSvg } from "../../core/draw-svg";
import { GameObject } from "../../core/game-object";
import { Vector } from "../../core/vector";
import { FishEye } from "./fish-eye";
import { RoundedScales } from "./rounded-scales";

export class Fish extends GameObject {
	texture: Canvas;

	constructor(args: any = {}) {
		super(args);
		this.texture = new Canvas({
			size: new Vector(16, 16),
			children: [
				new RoundedScales({
					id: "texture",
				}),
			],
		});
		this.children = [this.texture, new FishEye({ pos: new Vector(37, 7) })];
	}

	update(deltaT: number) {
		// if (typeof this.ogScale == "undefined") {
		// 	this.ogScale = this.scale;
		// }
		// this.scale = this.ogScale - 0.5 * Math.abs(Math.sin(Game.oldT / 1000));
		// this.rotation += delta / 1000;
	}

	render(ctx: CanvasRenderingContext2D) {
		drawSvg(ctx, {
			path: "M40.5 64.5 38.1.3C22-1.5 15.5 32 35.5 62L32 77.5l1.8 1.9L38 74l9.2 2.9-6.7-12.4Z",
		});
		ctx.fillStyle = "#00000044";
		ctx.fill();
		drawSvg(ctx, {
			path: "m33.8 79.4 5.3-15 3 .6 5 11.9-6.5-5-6.9 7.5Z",
		});
		ctx.fillStyle = "#4e7dac";
		ctx.fill();
		drawSvg(ctx, {
			path: "M39 64.4c-9.3-21.6-10.6-58.8-.9-64 15 13.7 14.7 48 4 64.6l-3-.6Z",
		});
		const gradient = ctx.createLinearGradient(0, 0, this.size.x, 0);
		gradient.addColorStop(0.25, "#FFFFFF");
		gradient.addColorStop(0.75, "#4a86f5");
		ctx.fillStyle = gradient;
		ctx.fill();
		const pattern = ctx.createPattern(this.texture.canvas, "repeat");
		ctx.fillStyle = pattern!;
		ctx.fill();
		drawSvg(ctx, {
			path: "m39 64.4 1.2.2m2 .4-1-.2m-1-.2-1.5 7m1.5-7 1 .2m0 0 1.3 5.8",
		});
		ctx.lineCap = "round";
		ctx.stroke();
		// ctx.lineWidth = 4;
		// ctx.lineCap = "round";
		// ctx.lineJoin = "bevel";
		// ctx.strokeStyle = "white";
		// ctx.stroke();
		super.render(ctx);
	}
}
