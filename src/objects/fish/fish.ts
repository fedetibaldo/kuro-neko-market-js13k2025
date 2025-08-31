import { Viewport } from "../../core/viewport";
import { drawSvg } from "../../core/draw-svg";
import { GameObject, GameObjectArgs } from "../../core/game-object";
import { CENTER, Vector, ZERO } from "../../core/vector";
import { gradient } from "../../utils/gradient";
import { FishEye } from "./fish-eye";
import {
	DropTargetInterface,
	PickupableInterface,
} from "../../systems/interactable/interactable.types";
import { Svg } from "../svg";
import { FishType, fishTypes } from "../../data/fish-types";

type FishArgs = GameObjectArgs & {
	flipH?: boolean;
	type: number;
};

export class Fish
	extends GameObject
	implements PickupableInterface, DropTargetInterface
{
	flipH: boolean;
	type: FishType;
	shape = this.getChild("shape") as FishShape;
	size = this.shape.size;

	constructor({ flipH = false, type, ...rest }: FishArgs) {
		super({ flipH, type: fishTypes[type], ...rest });
	}

	createChildren(): GameObject[] {
		const createEye = (pos: Vector, diameter: number, size: Vector) => {
			const eyeXPolar = pos.x - size.x / 2;
			return new FishEye({
				size: Vector(diameter, diameter),
				pos: Vector(
					size.x / 2 +
						eyeXPolar * (this.flipH ? -1 : 1) -
						(this.flipH ? diameter : 0),
					pos.y
				),
			});
		};
		return [
			new FishShape({
				id: "shape",
				flipH: this.flipH,
				...this.type,
				children: [
					...this.type.eyes.map(([diameter, pos]) =>
						createEye(pos, diameter, this.type.size)
					),
					new Viewport({
						id: "texture",
						size: Vector(16, 16),
						children: [
							new Svg({ path: this.type.pattern, size: Vector(16, 16) }),
						],
					}),
				],
			}),
		];
	}

	layer = 0.75;
	baseLayer = 0.75;
	readonly canBePickedUp = true;
	origin = CENTER;
	center = this.size.mul(1 / 2);

	canHost(obj: GameObject) {
		return obj.id == "ticket";
	}
	host(obj: PickupableInterface) {
		this.getChild("ticket")?.destroy();
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
