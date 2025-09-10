import {
	GAME_OBJECT_CHILDREN_CHANGE_EVENT,
	GAME_OBJECT_MOUNT_EVENT,
	GameObject,
	GameObjectArgs,
} from "../../core/game-object";
import { CENTER, LEFT, Vector } from "../../core/vector";
import {
	DropTargetInterface,
	PickupableInterface,
} from "../../systems/interactable/interactable.types";
import { LevelSystem } from "../../systems/level/level.system";
import { diContainer } from "../../core/di-container";
import { Paper } from "../paper";
import { FishGraphic } from "./fish-graphic";
import { TICKET_ID } from "../printer/printer";
import { easeOut, makeFixedTimeIncrementalLerp } from "../../core/lerp";
import { clamp } from "../../utils/clamp";
import { drawSvg } from "../../core/draw-svg";
import { stroke } from "../../utils/draw";
import { ParticleSystem } from "../../systems/particle/particle.system";
import { Particle } from "../../systems/particle/particle";
import { GLYPH_CROSS, GLYPH_TICK } from "../../data/glyphs";
import { Ray } from "../particles/ray";
import { Cross } from "../particles/cross";

type FishArgs = GameObjectArgs & {
	flipH?: boolean;
	fishIndex: number;
};

export class Fish
	extends GameObject
	implements PickupableInterface, DropTargetInterface
{
	level: LevelSystem;

	fishIndex: number;
	value = 0;

	graphic: FishGraphic;

	layer = 0.75;
	baseLayer = 0.75;
	canBePickedUp = true;
	origin = CENTER;
	center: Vector;

	constructor({ flipH = false, fishIndex, ...rest }: FishArgs) {
		super(rest);

		this.level = diContainer.get(LevelSystem);

		this.fishIndex = fishIndex;

		const type = this.level.getFish(fishIndex);
		this.size = type.size;
		this.center = this.size.mul(1 / 2);

		this.graphic = new FishGraphic({ flipH, type });

		this.addChild(this.graphic);

		this.on(GAME_OBJECT_MOUNT_EVENT, () => this.attemptScore());
		this.on(GAME_OBJECT_CHILDREN_CHANGE_EVENT, () => this.attemptScore());
	}

	attemptScore() {
		if (this.parent?.id != "belt") return;
		const ticket = this.getChild<Paper>(TICKET_ID);
		if (!ticket) return;
		const value = ticket.value;
		const isCorrect = this.level.verifyScore(this.fishIndex, value);
		const particle = diContainer.get(ParticleSystem);
		particle.spawnRadial(
			this.toGlobal(this.center),
			isCorrect ? Ray : Cross,
			isCorrect ? 8 : 4
		);
		if (isCorrect) {
			particle.spawn(this.toGlobal(this.center), Check);
			this.canHost = false;
			this.opacity = 0.5;
			this.canBePickedUp = false;
		}
	}

	canHost: boolean | ((obj: GameObject) => boolean) = (obj: GameObject) => {
		return obj.id == TICKET_ID;
	};

	host(obj: PickupableInterface) {
		this.getChild(TICKET_ID)?.kill();
		obj.canBePickedUp = false;
	}
	getDropPoint(point: Vector): Vector {
		return this.toGlobal(this.size.mul(1 / 2));
	}
	pickup(): void {
		this.graphic.isShadowHidden = true;
	}
	drop(target: DropTargetInterface) {
		this.graphic.isShadowHidden = false;
		this.layer = target.layer;
	}
}

class Check extends Particle {
	origin = CENTER;
	size = Vector(9, 9);
	update(deltaT: number): void {
		super.update(deltaT);
		this.scale = this._progress * 4;
	}
	render(ctx: OffscreenCanvasRenderingContext2D): void {
		drawSvg(ctx, {
			path: GLYPH_TICK,
		});
		stroke(ctx, "#FEE2E2", 2);
	}
}
