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

type FishType = {
	size: Vector;
	pattern: string;
	shadow: string;
	tail: string;
	body: string;
	bodyFill1: string;
	bodyFill2: string;
	tailFill: string;
	details: string;
	eyes: [number, Vector][];
};

const types: FishType[] = [
	{
		size: Vector(40, 70),
		pattern:
			"M16 12c-3 0-4-4-4-4s-1 4-4 4-4-4-4-4-1 4-4 4M0 0s1 4 4 4 4-4 4-4 1 4 4 4 4-4 4-4",
		shadow: "M23 65 20 0C4-1-2 32 18 62l-4 16 2 1 4-5 9 3-6-12Z",
		tailFill: "#429247",
		bodyFill1: "#9BD39F",
		bodyFill2: "#429247",
		tail: "m16 79 5-15 3 1 5 12-6-5-7 7Z",
		body: "M21 64C12 43 10 6 20 0c15 14 15 48 4 65l-3-1Z",
		details: "m21 64 1 1m2 0h-1m-1 0-1 7m1-7h1m0 0 2 6",
		eyes: [[8, Vector(19, 7)]],
	},
	{
		size: Vector(50, 70),
		pattern:
			"M0 1c3 0 5 4 8 4s5-4 8-4M0 5c2 0 2 3 0 3m16 0c-2 0-2-3 0-3M0 13c3 0 5-4 8-4s5 4 8 4m-8 0c-2 0-2 3 0 3s2-3 0-3Z",
		shadow: "M28 79 25 0c-26 6-36 45-4 64 0 4-11 13 7 15Z",
		tailFill: "#D7A374",
		bodyFill1: "#D7A374",
		bodyFill2: "#B27242",
		tail: "M21 76c-3-1 6-14 6-14C3 47-6 32 25 1c35 16 21 41 4 61 0 0 8 14 6 15-4 2-9 2-14-1Z",
		body: "M24 57C7 40 4 16 25 0c21 15 21 37 6 58v7h-6s1-6-1-8Z",
		details:
			"M39 43h3m-1-8h3m-2-8h3m-5-7h4m-34 7H8m3 7H7m6 7H9m7 7h-3m13 17h4m-3 0-1 8m3-8 2 10",
		eyes: [
			[6, Vector(24, 6)],
			[4, Vector(27, 2)],
		],
	},
	{
		size: Vector(40, 70),
		pattern: "m0 2 8-1 8 1M0 10l8-1 8 1",
		shadow: "M21 79 17 1C3-1-10 25 15 65l-3 13 3 1h6Z",
		tailFill: "#912B2B",
		bodyFill1: "#ED8926",
		bodyFill2: "#B44141",
		tail: "m15 79 2-10 4 3 3-2 5 9H15Z",
		body: "M28 12c5 10 1 34-5 52l1 6-3 2-4-3 1-7c-4-6-8-27-8-29 0-11 0-29 7-32 6 2 9 6 11 11Z",
		details: "m17 69 2 1m5 0-2 1m-1 1-2-2m2 2v5m0-5 1-1m-3-1-1 5m4-4 3 6",
		eyes: [[4, Vector(22, 7)]],
	},
];

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
		super({ flipH, type: types[type], ...rest });
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
						children: [new FishScales({ path: this.type.pattern })],
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

type FishScalesArgs = GameObjectArgs & {
	path: string;
};

export class FishScales extends GameObject {
	size = Vector(16, 16);
	path: string;

	constructor({ path, ...rest }: FishScalesArgs) {
		super(rest);
		this.path = path;
	}

	render(ctx: OffscreenCanvasRenderingContext2D) {
		// ctx.fillStyle = "red";
		// ctx.fillRect(0, 0, this.size.x, this.size.y);
		ctx.strokeStyle = "#3A1141";
		ctx.lineWidth = 1;
		drawSvg(ctx, {
			path: this.path,
		});
		ctx.stroke();
	}
}

type FishShapeArgs = GameObjectArgs & {
	shadow: string;
	tail: string;
	body: string;
	details: string;
	flipH?: boolean;
	tailFill: string;
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
	tailFill: string;
	bodyFill1: string;
	bodyFill2: string;

	texture = this.getChild("texture") as Viewport;

	constructor({
		flipH = false,
		shadow,
		tail,
		body,
		details,
		tailFill,
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
		this.tailFill = tailFill;
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
		ctx.fillStyle = this.tailFill;
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
