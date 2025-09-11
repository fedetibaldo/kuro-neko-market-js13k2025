import { diContainer } from "../core/di-container";
import { GameObject } from "../core/game-object";
import { BOTTOM, Vector, ZERO } from "../core/vector";
import {
	LEVEL_DURATION,
	LEVEL_TICK_EVENT,
	LevelSystem,
} from "../systems/level/level.system";
import { fill, fillRect } from "../utils/draw";
import { gradient } from "../utils/gradient";
import { rotateAroundOrigin } from "../utils/origin-helper";

export class Sky extends GameObject {
	sunAngle = Math.PI;

	onLevelTick = (t: number): void => {
		this.sunAngle = Math.PI - (Math.PI / LEVEL_DURATION) * t;
	};

	toKill = diContainer.get(LevelSystem).on(LEVEL_TICK_EVENT, this.onLevelTick);

	kill() {
		super.kill();
		this.toKill();
	}

	render(ctx: OffscreenCanvasRenderingContext2D): void {
		fillRect(
			ctx,
			ZERO,
			this.size,
			gradient(ctx, ZERO, Vector(0, this.size.y), [
				[0, "#EA9D50"],
				[1, "#E5B993"],
			])
		);

		const sunOrigin = this.size.mulv(BOTTOM);
		const sunPos = Vector(this.size.x / 2 / 4, this.size.y);
		const { x, y } = rotateAroundOrigin(sunPos, this.sunAngle, sunOrigin);

		ctx.beginPath();
		ctx.arc(
			x,
			y + (this.size.y - y) * 2 * (this.size.y / this.size.x),
			20,
			0,
			Math.PI * 2,
			true
		);
		fill(ctx, "#F9F3EF");
	}
}
