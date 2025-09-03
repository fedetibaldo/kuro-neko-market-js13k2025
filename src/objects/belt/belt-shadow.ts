import { GameObject } from "../../core/game-object";

export class BeltShadow extends GameObject {
	render(ctx: OffscreenCanvasRenderingContext2D): void {
		ctx.fillStyle = "#00000088";
		ctx.fillRect(0, this.size.y - 10, this.size.x, 20);
	}
}
