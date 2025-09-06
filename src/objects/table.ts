import { GameObject } from "../core/game-object";
import { WOOD_ID } from "./patterns/wood";
import { makePattern } from "../utils/pattern";

export class Table extends GameObject {
	override render(ctx: OffscreenCanvasRenderingContext2D) {
		ctx.fillStyle = makePattern(ctx, WOOD_ID);
		ctx.fillRect(0, 0, this.size.x, this.size.y);
	}
}
