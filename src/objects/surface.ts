import { diContainer } from "../core/di-container";
import { GameObject, GameObjectArgs } from "../core/game-object";
import { INPUT_MOUSEDOWN_EVENT, InputServer } from "../core/input.server";
import { unique } from "../core/unique";
import { Vector, ZERO } from "../core/vector";
import { fillRoundRect, stroke } from "../utils/draw";

export const SURFACE_CLICK = unique();

export type InactiveSurfaceArgs = GameObjectArgs & {
	radius: number;
};

export class InactiveSurface extends GameObject {
	radius: number;

	constructor({ radius, ...rest }: InactiveSurfaceArgs) {
		super(rest);
		this.radius = radius;
	}
	render(ctx: OffscreenCanvasRenderingContext2D): void {
		fillRoundRect(ctx, ZERO, this.size, this.radius, "#560A0A55");
	}
}

export class ActiveSurface extends InactiveSurface {
	mouseDownListener = diContainer
		.get(InputServer)
		.on(
			INPUT_MOUSEDOWN_EVENT,
			({ pos }) => this.isPointWithinObject(pos) && this.trigger(SURFACE_CLICK)
		);

	kill() {
		super.kill();
		this.mouseDownListener();
	}

	render(ctx: OffscreenCanvasRenderingContext2D): void {
		fillRoundRect(ctx, Vector(0, 2), this.size, this.radius, "#000000dd");
		fillRoundRect(ctx, ZERO, this.size, this.radius, "#FF9838dd");
		stroke(ctx, "white");
	}
}
