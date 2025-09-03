import { diContainer } from "../core/di-container";
import {
	GAME_OBJECT_KILL_EVENT,
	GameObject,
	GameObjectArgs,
} from "../core/game-object";
import { BOTTOM, Vector, ZERO } from "../core/vector";
import {
	LEVEL_DURATION,
	LEVEL_TICK_EVENT,
	LevelSystem,
} from "../systems/level/level.system";
import { gradient } from "../utils/gradient";
import { rotateAroundOrigin } from "../utils/origin-helper";

export class Sky extends GameObject {
	sunAngle = Math.PI;

	constructor(args: GameObjectArgs) {
		super(args);
		const level = diContainer.get(LevelSystem);
		this.on(
			GAME_OBJECT_KILL_EVENT,
			level.on(LEVEL_TICK_EVENT, this.onLevelTick)
		);
	}

	onLevelTick = (t: number): void => {
		this.sunAngle = Math.PI - (Math.PI / LEVEL_DURATION) * t;
	};

	render(ctx: OffscreenCanvasRenderingContext2D): void {
		ctx.fillStyle = gradient(ctx, ZERO, Vector(0, this.size.y), [
			[0, "#EA9D50"],
			[1, "#E5B993"],
		]);
		ctx.fillRect(0, 0, this.size.x, this.size.y);

		const sunOrigin = this.size.mulv(BOTTOM);
		const sunPos = Vector(this.size.x / 2 / 4, this.size.y);
		const { x, y } = rotateAroundOrigin(sunPos, this.sunAngle, sunOrigin);

		ctx.fillStyle = "#F9F3EF";
		ctx.beginPath();
		ctx.arc(
			x,
			y + (this.size.y - y) * 2 * (this.size.y / this.size.x),
			20,
			0,
			Math.PI * 2,
			true
		);
		ctx.fill();
	}
}
