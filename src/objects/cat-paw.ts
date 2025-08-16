import { diContainer } from "../core/di-container";
import { drawSvg } from "../core/draw-svg";
import { Game } from "../core/game";
import { GameObject } from "../core/game-object";
import { Input } from "../core/input";
import {
	easeInOut,
	easeOut,
	IncrementalLerp,
	makeFixedTimeIncrementalLerp,
} from "../core/lerp";
import { Vector } from "../core/vector";
import { clamp } from "../utils/clamp";
import { Fish } from "./fish/fish";

class Pointer extends GameObject {
	size = new Vector(2);
	override render(ctx: CanvasRenderingContext2D) {
		ctx.beginPath();
		ctx.arc(0, 0, this.size.x, 0, Math.PI * 2, true);
		ctx.strokeStyle = "white";
		ctx.stroke();
		super.render(ctx);
	}
}

export class CatPawGraphic extends GameObject {
	game = diContainer.get(Game);

	halfWidth = 22;
	viewBox = new Vector(this.halfWidth, 71);
	center = new Vector(this.halfWidth, 22);
	origin = this.center.mulv(this.viewBox.oneOver());

	isFaceUp = false;
	size = this.viewBox;

	override render(ctx: CanvasRenderingContext2D) {
		const viewBox = new Vector(22, 71);
		const drawCalls = [{}, { offsetX: viewBox.x - 1, flipH: true }];
		for (const { offsetX, flipH } of drawCalls) {
			ctx.save();
			ctx.fillStyle = "#19191A";
			if (offsetX) {
				ctx.translate(offsetX, 0);
			}
			drawSvg(ctx, {
				path: "M22 1C12-2 10 5 8 11c-11.5 3-7 11.5-6.5 16 .228 2.049 0 4 .5 6 3.024 12.096 2 28.592 2 38h18V1Z",
				viewBox,
				flipH,
			});
			ctx.fill();
			ctx.restore();
		}
		if (this.isFaceUp) {
			for (const { offsetX, flipH } of drawCalls) {
				ctx.save();
				if (offsetX) {
					ctx.translate(offsetX, 0);
				}
				ctx.fillStyle = "#E6B9B9";
				drawSvg(ctx, {
					path: "M20 13c0 4.1-1.5 6.5-3.5 6.5-1.9 0-3.5-2.4-3.5-6.5s2.1-8 4-8c2 0 3 3.9 3 8Z",
					viewBox,
					flipH,
				});
				ctx.fill();
				drawSvg(ctx, {
					path: "M11.7 22c.9 2.9-.2 4.4-2 5-1.9.6-3.8-.1-4.7-3-.9-2.9-.5-6.9 1.4-7.5 1.8-.5 4.4 2.6 5.3 5.5Z",
					viewBox,
					flipH,
				});
				ctx.fill();
				drawSvg(ctx, {
					path: "M16 28c2.5-2 3-6 6-6v15c-1.7 0-5.3 2-8 1.5-3.5-.6-5.4-3-4.5-5.5 1.1-3.4 4.2-3.1 6.5-5Z",
					viewBox,
					flipH,
				});
				ctx.fill();
				ctx.restore();
			}
		}
		ctx.fillStyle = "#19191A";
		ctx.fillRect(4, viewBox.y - 1, viewBox.x * 2 - 9, this.game.viewSize!.y);

		super.render(ctx);
	}
}

export class CatPaw extends GameObject {
	game = diContainer.get(Game);
	input = diContainer.get(Input);

	graphic: CatPawGraphic;
	pointer: Pointer;

	heldFish: Fish | undefined;
	get isHoldingFish() {
		return !!this.heldFish;
	}

	target = new Vector();
	isInteractionLocked = false;
	isAnimationLocked = false;
	seekPos = new Vector();
	pickupPos = new Vector();
	seekLerp: IncrementalLerp<Vector> | undefined;
	pickUpLerp: IncrementalLerp<Vector> | undefined;
	scaleLerp: IncrementalLerp<number> | undefined;

	constructor(args = {}) {
		super(args);
		this.input.on("mousemove", this.onMouseMove);
		this.graphic = new CatPawGraphic();
		this.graphic.pos = this.graphic.center;
		this.pointer = new Pointer();
		this.addChildren([this.graphic, this.pointer]);
	}

	onMouseMove = () => {
		this.target = this.input.mousePos;
		this.seekToTarget();
	};

	seekToTarget() {
		if (this.isAnimationLocked) return;
		this.seekLerp = makeFixedTimeIncrementalLerp(
			this.seekPos,
			this.target,
			200,
			easeOut
		);
	}

	tapGround() {
		const tapDuration = 150;
		this.scaleLerp = makeFixedTimeIncrementalLerp(
			this.graphic.scale,
			0.75,
			tapDuration,
			easeInOut
		);
		setTimeout(() => {
			this.scaleLerp = makeFixedTimeIncrementalLerp(
				this.graphic.scale,
				1,
				tapDuration,
				easeInOut
			);
		}, 150);
	}

	preBorrow(fish: Fish) {
		this.heldFish = fish;
		this.trigger("preborrow", fish);
	}

	borrow(fish: Fish, startingScale: number) {
		this.trigger("borrow", this.heldFish);
		fish.scale = startingScale;
		fish.pos = this.graphic.center.diff(fish.size.mul(1 / 2));
		this.heldFish!.isShadowHidden = true;
		this.graphic.addChild(fish);
	}

	preDrop() {
		const heldFish = this.heldFish;
		this.heldFish = undefined;
		this.graphic.removeChild(heldFish);
		heldFish!.isShadowHidden = false;
		this.trigger("predrop", heldFish);
	}

	drop() {
		this.trigger("drop");
	}

	async pickUp(fish: Fish, depth: number, ratio: number) {
		if (this.isInteractionLocked) return;
		const prevTarget = this.target;
		this.target = fish.pos.add(fish.center);
		this.seekToTarget();

		this.isInteractionLocked = true;
		this.isAnimationLocked = true;
		this.target = prevTarget;

		let pickUpDuration = 100;

		this.pickUpLerp = makeFixedTimeIncrementalLerp(
			Vector.ZERO,
			Vector.DOWN.mul(40),
			pickUpDuration,
			easeInOut
		);
		this.scaleLerp = makeFixedTimeIncrementalLerp(
			1,
			1 - depth,
			pickUpDuration,
			easeInOut
		);

		await new Promise((resolve) => setTimeout(resolve, pickUpDuration));

		this.graphic.isFaceUp = true;
		this.isInteractionLocked = false;
		this.preBorrow(fish);

		this.pickUpLerp = makeFixedTimeIncrementalLerp(
			Vector.DOWN.mul(40),
			Vector.ZERO,
			pickUpDuration
		);

		await new Promise((resolve) => setTimeout(resolve, pickUpDuration));

		this.isAnimationLocked = false;
		this.seekToTarget();
		this.borrow(fish, 1 - depth + (ratio - (1 - depth)));

		if (this.isInteractionLocked) {
			pickUpDuration = 75;
		}

		this.pickUpLerp = undefined;
		this.scaleLerp = makeFixedTimeIncrementalLerp(
			1 - depth,
			1,
			pickUpDuration,
			easeInOut
		);
	}

	async putDown(position: Vector, depth: number) {
		if (this.isInteractionLocked) return;
		const prevTarget = this.target;
		this.target = position;
		this.seekToTarget();

		this.isInteractionLocked = true;
		this.isAnimationLocked = true;
		this.target = prevTarget;

		let putDownDuration = 100;

		this.scaleLerp = makeFixedTimeIncrementalLerp(
			1,
			1 - depth,
			putDownDuration,
			easeInOut
		);
		await new Promise((resolve) => setTimeout(resolve, putDownDuration));

		this.isInteractionLocked = false;
		this.preDrop();

		this.pickUpLerp = makeFixedTimeIncrementalLerp(
			Vector.ZERO,
			Vector.DOWN.mul(40),
			putDownDuration
		);

		await new Promise((resolve) => setTimeout(resolve, putDownDuration));

		this.graphic.isFaceUp = false;
		this.isAnimationLocked = false;
		this.seekToTarget();
		this.drop();

		if (this.isInteractionLocked) {
			putDownDuration = 75;
		}

		this.pickUpLerp = makeFixedTimeIncrementalLerp(
			Vector.DOWN.mul(40),
			Vector.ZERO,
			putDownDuration
		);
		this.scaleLerp = makeFixedTimeIncrementalLerp(
			1 - depth,
			1,
			putDownDuration,
			easeInOut
		);
	}

	override update(deltaT: number) {
		if (this.seekLerp) {
			this.seekPos = this.seekLerp(deltaT);
		}
		if (this.pickUpLerp) {
			this.pickupPos = this.pickUpLerp(deltaT);
		}

		this.pointer.pos = this.target;
		this.graphic.pos = this.seekPos
			.add(this.graphic.center.mul(-1))
			.add(this.pickupPos);

		if (this.scaleLerp) {
			this.graphic.scale = this.scaleLerp(deltaT);
		}

		// this.pointer.opacity = clamp(
		// 	(Math.abs(
		// 		this.graphic.pos.add(this.graphic.center).diff(this.target).length()
		// 	) -
		// 		20) /
		// 		40,
		// 	0,
		// 	1
		// );

		super.update(deltaT);
	}
}
