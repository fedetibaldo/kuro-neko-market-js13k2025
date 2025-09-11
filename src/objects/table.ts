import { GameObject } from "../core/game-object";
import { WOOD_ID } from "./patterns/wood";
import { makePattern } from "../utils/pattern";
import { fillRect } from "../utils/draw";
import { ZERO } from "../core/vector";

export class Table extends GameObject {
	render(ctx: OffscreenCanvasRenderingContext2D) {
		fillRect(ctx, ZERO, this.size, makePattern(ctx, WOOD_ID));
	}
}
