import { GameObject } from "../../core/game-object";
import { fillCircle, stroke } from "../../utils/draw";

export class FishEye extends GameObject {
	render(ctx: OffscreenCanvasRenderingContext2D) {
		fillCircle(ctx, this.size.x / 2, this.color as string);
		stroke(ctx, "white", 2);
	}
}
