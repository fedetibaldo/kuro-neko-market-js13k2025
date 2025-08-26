import { Viewport } from "../core/viewport";
import { GameObject } from "../core/game-object";
import { Vector } from "../core/vector";
import { Wood } from "./wood";
import { DropTargetInterface } from "../systems/interactable/interactable.types";

export class Table extends GameObject implements DropTargetInterface {
	override createChildren() {
		return [
			new Viewport({
				id: "wood",
				size: new Vector(60, 60),
				children: [new Wood()],
			}),
		];
	}

	override render(ctx: OffscreenCanvasRenderingContext2D) {
		const pattern = ctx.createPattern(
			(this.getChild("wood") as Viewport).canvas,
			"repeat"
		)!;
		ctx.fillStyle = pattern;
		ctx.fillRect(0, 0, this.size.x, this.size.y);
	}
}
