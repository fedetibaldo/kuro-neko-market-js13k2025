import { diContainer } from "../core/di-container";
import { GameObject } from "../core/game-object";
import { InputServer } from "../core/input.server";
import { ONE } from "../core/vector";
import { stroke, traceCircle } from "../utils/draw";

export class Pointer extends GameObject {
	override update(deltaT: number): void {
		this.pos = diContainer.get(InputServer).mousePos;
	}

	override render(ctx: OffscreenCanvasRenderingContext2D) {
		traceCircle(ctx, ONE.mul(-2), 2);
		stroke(ctx, "#FEE2E2");
	}
}
