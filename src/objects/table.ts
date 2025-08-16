import { Canvas } from "../core/canvas";
import { GameObject } from "../core/game-object";
import { Vector } from "../core/vector";
import { Wood } from "./wood";

export class Table extends GameObject {
	override createChildren() {
		return [
			new Canvas({
				id: "texture",
				size: new Vector(60, 60),
				children: [new Wood()],
			}),
		];
	}

	override render(ctx: CanvasRenderingContext2D) {
		const pattern = ctx.createPattern(
			this.getChild("texture").canvas,
			"repeat"
		)!;
		ctx.fillStyle = pattern;
		ctx.fillRect(0, 0, this.size.x, this.size.y);
		super.render(ctx);
	}
}
