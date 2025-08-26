import { GameObject } from "../core/game-object";

export class Sea extends GameObject {
	render(ctx: OffscreenCanvasRenderingContext2D): void {
		ctx.fillStyle = "#9C5FA7";
		ctx.fillRect(0, 0, this.size.x, this.size.y);
	}
}
