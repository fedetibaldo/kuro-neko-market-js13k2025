import { GameObject } from "../../core/game-object";

export class FishEye extends GameObject {
	render(ctx: CanvasRenderingContext2D) {
		ctx.beginPath();
		ctx.arc(4, 4, 4, 0, Math.PI * 2, false);
		ctx.closePath();
		ctx.fillStyle = "black";
		ctx.fill();
		ctx.lineWidth = 2;
		ctx.strokeStyle = "white";
		ctx.stroke();

		super.render(ctx);
	}
}
