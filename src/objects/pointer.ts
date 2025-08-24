import { diContainer } from "../core/di-container";
import { GameObject } from "../core/game-object";
import { InputServer } from "../core/input.server";

export class Pointer extends GameObject {
	radius = 2;
	input = diContainer.get(InputServer);

	override update(deltaT: number): void {
		this.pos = this.input.mousePos;
	}

	override render(ctx: OffscreenCanvasRenderingContext2D) {
		ctx.beginPath();
		ctx.arc(0, 0, this.radius, 0, Math.PI * 2, true);
		ctx.strokeStyle = "white";
		ctx.stroke();
	}
}
