import { GameObject } from "../../core/game-object";

export class FishEye extends GameObject {
	render(ctx: OffscreenCanvasRenderingContext2D) {
		ctx.beginPath();
		ctx.arc(
			this.size.x / 2,
			this.size.x / 2,
			this.size.x / 2,
			0,
			Math.PI * 2,
			false
		);
		ctx.closePath();
		ctx.fillStyle = this.color as string;
		// ctx.fillStyle = "#C7B3CA";
		ctx.fill();
		ctx.lineWidth = 2;
		ctx.strokeStyle = "white";
		ctx.stroke();
	}
}
