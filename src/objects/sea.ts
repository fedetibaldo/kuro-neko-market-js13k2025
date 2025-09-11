import { GameObject } from "../core/game-object";
import { ZERO } from "../core/vector";
import { fillRect } from "../utils/draw";

export class Sea extends GameObject {
	render(ctx: OffscreenCanvasRenderingContext2D): void {
		fillRect(ctx, ZERO, this.size, "#9C5FA7");
	}
}
