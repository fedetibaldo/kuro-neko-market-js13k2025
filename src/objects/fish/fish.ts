import { Viewport } from "../../core/viewport";
import { drawSvg } from "../../core/draw-svg";
import {
	GAME_OBJECT_CHILDREN_CHANGE_EVENT,
	GAME_OBJECT_MOUNT_EVENT,
	GameObject,
	GameObjectArgs,
} from "../../core/game-object";
import { CENTER, Vector, ZERO } from "../../core/vector";
import { gradient } from "../../utils/gradient";
import { FishEye } from "./fish-eye";
import {
	DropTargetInterface,
	PickupableInterface,
} from "../../systems/interactable/interactable.types";
import { Svg } from "../svg";
import { LevelSystem } from "../../systems/level/level.system";
import { diContainer } from "../../core/di-container";
import { Paper } from "../paper";

type FishArgs = GameObjectArgs & {
	flipH?: boolean;
	fishIndex: number;
};

export class Fish
	extends GameObject
	implements PickupableInterface, DropTargetInterface
{
	id = "fish";
	level: LevelSystem;

	flipH: boolean;
	fishIndex: number;
	value = 0;

	shape: FishShape;
	center: Vector;

	constructor({ flipH = false, fishIndex, ...rest }: FishArgs) {
		super(rest);

		this.level = diContainer.get(LevelSystem);

		this.fishIndex = fishIndex;
		this.flipH = flipH;

		const type = this.level.getFish(fishIndex);

		const createEye = (pos: Vector, diameter: number, size: Vector) => {
			const eyeXPolar = pos.x - size.x / 2;
			return new FishEye({
				size: Vector(diameter, diameter),
				color: type.eyeColor,
				pos: Vector(
					size.x / 2 +
						eyeXPolar * (this.flipH ? -1 : 1) -
						(this.flipH ? diameter : 0),
					pos.y
				),
			});
		};

		this.addChildren([
			new FishShape({
				flipH: this.flipH,
				...type,
				id: "shape",
				children: [
					...type.eyes.map(([diameter, pos]) =>
						createEye(pos, diameter, type.size)
					),
					new Viewport({
						id: "texture",
						size: Vector(16, 16),
						children: [new Svg({ path: type.pattern, size: Vector(16, 16) })],
					}),
				],
			}),
		]);

		this.shape = this.getChild("shape") as FishShape;
		this.size = this.shape.size;
		this.center = this.size.mul(1 / 2);

		this.on(GAME_OBJECT_MOUNT_EVENT, () => this.attemptScore());
		this.on(GAME_OBJECT_CHILDREN_CHANGE_EVENT, () => this.attemptScore());
	}

	layer = 0.75;
	baseLayer = 0.75;
	canBePickedUp = true;
	origin = CENTER;

	attemptScore() {
		if (this.parent?.id != "belt") return;
		const ticket = this.getChild<Paper>("ticket");
		if (!ticket) return;
		const value = ticket.value;
		if (!this.level.verifyScore(this.fishIndex, value)) {
			// TODO: Show X
			return;
		}
		// TODO: Show v
		this.canHost = false;
		this.opacity = 0.5;
		this.canBePickedUp = false;
	}

	canHost: boolean | ((obj: GameObject) => boolean) = (obj: GameObject) => {
		return obj.id == "ticket";
	};

	host(obj: PickupableInterface) {
		this.getChild("ticket")?.kill();
		obj.canBePickedUp = false;
	}
	getDropPoint(point: Vector): Vector {
		return this.toGlobal(this.size.mul(1 / 2));
	}
	pickup(): void {
		this.shape.isShadowHidden = true;
	}
	drop(target: DropTargetInterface) {
		this.shape.isShadowHidden = false;
		this.layer = target.layer;
	}
}

type FishShapeArgs = GameObjectArgs & {
	shadow: string;
	tail: string;
	body: string;
	details: string;
	flipH?: boolean;
	tailFill1: string;
	tailFill2: string;
	bodyFill1: string;
	bodyFill2: string;
};

class FishShape extends GameObject {
	isShadowHidden = false;
	flipH: boolean;
	shadow: string;
	tail: string;
	body: string;
	details: string;
	tailFill1: string;
	tailFill2: string;
	bodyFill1: string;
	bodyFill2: string;

	texture = this.getChild("texture") as Viewport;

	constructor({
		flipH = false,
		shadow,
		tail,
		body,
		details,
		tailFill1,
		tailFill2,
		bodyFill1,
		bodyFill2,
		...rest
	}: FishShapeArgs) {
		super(rest);
		this.flipH = flipH;
		this.shadow = shadow;
		this.tail = tail;
		this.body = body;
		this.details = details;
		this.tailFill1 = tailFill1;
		this.tailFill2 = tailFill2;
		this.bodyFill1 = bodyFill1;
		this.bodyFill2 = bodyFill2;
	}

	render(ctx: OffscreenCanvasRenderingContext2D) {
		if (!this.isShadowHidden) {
			drawSvg(ctx, {
				path: this.shadow,
				viewBox: this.size,
				flipH: this.flipH,
			});
			ctx.fillStyle = "#00000044";
			ctx.fill();
		}
		drawSvg(ctx, {
			path: this.tail,
			viewBox: this.size,
			flipH: this.flipH,
		});
		ctx.fillStyle = gradient(ctx, Vector(0, 0), Vector(0, this.size.y + 10), [
			[0.85, this.tailFill1],
			[0.95, this.tailFill2],
		]);
		ctx.fill();
		drawSvg(ctx, {
			path: this.body,
			viewBox: this.size,
			flipH: this.flipH,
		});
		ctx.fillStyle = gradient(
			ctx,
			ZERO,
			Vector(this.size.x, 0),
			[
				[0.2, this.bodyFill2],
				[0.8, this.bodyFill1],
			],
			{ flipH: this.flipH }
		);
		ctx.fill();
		const pattern = ctx.createPattern(this.texture.canvas, "repeat");
		ctx.fillStyle = pattern!;
		ctx.fill();
		drawSvg(ctx, {
			path: this.details,
			viewBox: this.size,
			flipH: this.flipH,
		});
		ctx.lineCap = "round";
		ctx.strokeStyle = "#3A1141";
		ctx.stroke();
	}
}
