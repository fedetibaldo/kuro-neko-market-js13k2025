import { createLinearGradient } from "../utils/create-linear-gradient";
import { GameObject } from "./game-object";
import { Observable } from "./observable";
import { Vector } from "./vector";

export class Game extends Observable {
	constructor({
		canvas = document.createElement("canvas"),
		viewRes = new Vector(),
	}) {
		super();
		this.canvas = canvas;
		this.ctx = this.canvas.getContext("2d");

		this.viewRes = viewRes;

		this.subCanvas = document.createElement("canvas");
		this.subCanvas.width = this.viewRes.x;
		this.subCanvas.height = this.viewRes.y;
		this.subCtx = this.subCanvas.getContext("2d");

		this.subCtx.imageSmoothingEnabled = false;

		this.root = new GameObject({});
		this.oldT = 0;

		window.onresize = () => this.fitScreen();
		this.fitScreen();
	}
	fitScreen() {
		const computedStyle = window.getComputedStyle(this.canvas);
		this.canvasSize = new Vector(
			parseInt(computedStyle.width),
			parseInt(computedStyle.height)
		);
		this.canvas.width = this.canvasSize.x;
		this.canvas.height = this.canvasSize.y;

		this.ctx.imageSmoothingEnabled = false;

		const upscaleFactor = Math.min(
			this.canvasSize.x / this.viewRes.x,
			this.canvasSize.y / this.viewRes.y
		);

		this.viewSize = new Vector(
			this.viewRes.x * upscaleFactor,
			this.viewRes.y * upscaleFactor
		);

		this.viewPos = this.canvasSize.diff(this.viewSize).mul(1 / 2);
	}
	loop(newT) {
		window.requestAnimationFrame((newT) => this.loop(newT));
		if (this.root) {
			if (this.oldT) {
				const deltaT = newT - this.oldT;
				this.trigger("tick", deltaT);

				this.subCtx.fillStyle = createLinearGradient(
					this.subCtx,
					Vector.BOTTOM.mulv(this.viewRes),
					Vector.TOP.mulv(this.viewRes),
					[
						[0.5, "#B9F5FF"],
						[1, "#898FFA"],
					]
				);
				this.subCtx.fillRect(0, 0, this.viewRes.x, this.viewRes.y);

				this.root.update(deltaT);
				this.root.render(this.subCtx);

				this.ctx.drawImage(
					this.subCanvas,
					0,
					0,
					this.viewRes.x,
					this.viewRes.y,
					this.viewPos.x,
					this.viewPos.y,
					this.viewSize.x,
					this.viewSize.y
				);
			}
			this.oldT = newT;
		}
	}
	play() {
		this.loop();
	}
}
