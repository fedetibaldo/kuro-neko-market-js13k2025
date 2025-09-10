import { diContainer } from "../core/di-container";
import { GameObject } from "../core/game-object";
import { InputServer } from "../core/input.server";
import { ONE } from "../core/vector";
import { stroke, traceCircle } from "../utils/draw";

export class Pointer extends GameObject {
	radius = 2;
	input = diContainer.get(InputServer);

	override update(deltaT: number): void {
		this.pos = this.input.mousePos;
	}

	override render(ctx: OffscreenCanvasRenderingContext2D) {
		traceCircle(ctx, ONE.mul(-this.radius), this.radius);
		stroke(ctx, "white");
	}
}
