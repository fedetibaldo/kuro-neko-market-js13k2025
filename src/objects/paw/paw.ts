import { diContainer } from "../../core/di-container";
import { drawSvg } from "../../core/draw-svg";
import { Game } from "../../core/game";
import { GameObject } from "../../core/game-object";
import { InputServer } from "../../core/input.server";
import {
	easeIn,
	easeInOut,
	easeOut,
	IncrementalLerp,
	makeFixedTimeIncrementalLerp,
} from "../../core/lerp";
import { StateMachine } from "../../core/state-machine";
import { Vector, ZERO } from "../../core/vector";
import { canDrift } from "../../systems/drift/drift.system";
import {
	ClickEvent,
	MoveEvent,
	InteractableServer,
	isPickupable,
	isPressable,
	INTERACTABLE_MOVE_EVENT,
	INTERACTABLE_CLICK_EVENT,
} from "../../systems/interactable/interactable.server";
import {
	DropTargetInterface,
	PickupableInterface,
	PressableInterface,
} from "../../systems/interactable/interactable.types";
import {
	PAW_CARRY_ACTION,
	PAW_DROP_ACTION,
	PAW_IDLE_ACTION,
	PAW_IDLING_STATE,
	PAW_MOVING_TAG,
	PAW_NEXT_ACTION,
	PAW_PICKUP_ACTION,
	PAW_POINT_ACTION,
	PAW_POINTING_TAG,
	PAW_PRESS_ACTION,
	PAW_TAP_ACTION,
	pawStateMachine,
} from "./state";

class Nail extends GameObject {
	render(ctx: OffscreenCanvasRenderingContext2D): void {
		drawSvg(ctx, {
			path: "m11 15 5-14 5 13-10 1Z",
		});
		ctx.fillStyle = "#D58DE2";
		ctx.fill();
	}
}

export class CatPawGraphic extends GameObject {
	game = diContainer.get(Game);

	halfWidth = 22;
	viewBox = Vector(this.halfWidth, 71);
	center = Vector(this.halfWidth, 22);
	origin = this.center.mulv(this.viewBox.oneOver());

	isFaceUp = false;
	size = this.viewBox;

	override render(ctx: OffscreenCanvasRenderingContext2D) {
		const viewBox = Vector(22, 71);
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
		ctx.fillRect(4, viewBox.y - 1, viewBox.x * 2 - 9, 1000);
	}
}

export class Paw extends GameObject {
	game = diContainer.get(Game);
	input = diContainer.get(InputServer);
	interactable = diContainer.get(InteractableServer);

	paw = this.getChild("paw")!;
	graphic = this.getChild("graphic") as CatPawGraphic;
	nail = this.getChild("nail") as Nail;
	stagingArea = this.getChild("staging")!;

	_state = new StateMachine(pawStateMachine, PAW_IDLING_STATE);

	heldItem: PickupableInterface | null = null;
	movePos = this.pos;

	latestMoveArgs: MoveEvent | undefined;
	moveLerp: IncrementalLerp<Vector> | undefined;
	nailLerp: IncrementalLerp<Vector> | undefined;
	offsetLerp: IncrementalLerp<Vector> | undefined;
	scaleLerp: IncrementalLerp<number> | undefined;

	createChildren(): GameObject[] {
		const nail = new Nail({
			id: "nail",
		});
		const graphic = new CatPawGraphic({
			id: "graphic",
		});
		graphic.pos = graphic.center.mul(-1);
		nail.pos = graphic.pos;
		return [
			new GameObject({
				id: "paw",
				children: [nail, graphic],
			}),
			new GameObject({ id: "staging" }),
		];
	}

	baseLayer = 1;

	listeners = [
		this.interactable.on(INTERACTABLE_MOVE_EVENT, (e: MoveEvent) =>
			this.move(e)
		),
		this.interactable.on(INTERACTABLE_CLICK_EVENT, (e: ClickEvent) =>
			this.click(e)
		),
	];

	move({ hoveredItem, point }: MoveEvent) {
		this.latestMoveArgs = { hoveredItem, point };
		if (!hoveredItem || hoveredItem.canBePickedUp) {
			this.idle();
		}
		if (hoveredItem?.canBePressed) {
			this.point();
		}
		this.seek(point);
	}

	replayMove() {
		if (this.latestMoveArgs) {
			this.move(this.latestMoveArgs);
		}
	}

	click({ item, point, dropTargets }: ClickEvent) {
		if (item && isPickupable(item)) {
			this.pickup(item);
		}
		if (item && isPressable(item)) {
			// item.getPressPoint(point)
			this.press(item, point);
		}
		if (dropTargets && this.heldItem) {
			// TODO: block search (i.e., drop paper on fish -> tap vs fish on fish -> drop on surface behind)
			const dropTarget = dropTargets.find(
				(target) =>
					target.canHost === true || (target.canHost as any)(this.heldItem!)
			);
			if (dropTarget) {
				this.drop(dropTarget, point);
			}
			this.tap(point);
		}
	}

	seek(point: Vector) {
		if (!this._state.hasTag(PAW_MOVING_TAG)) return;
		const moveDuration = 200;
		this.moveLerp = makeFixedTimeIncrementalLerp(
			this.moveLerp ? this.moveLerp() : ZERO,
			point,
			moveDuration,
			easeOut
		);
	}

	async press(item: PressableInterface, point: Vector) {
		if (!this._state.can(PAW_PRESS_ACTION)) return;
		this._state.act(PAW_PRESS_ACTION);

		const target = item.getPressPoint(point);
		const pressDuration = 100;

		this.scaleLerp = makeFixedTimeIncrementalLerp(
			1,
			item.baseLayer / this.baseLayer,
			pressDuration,
			easeIn
		);
		this.offsetLerp = makeFixedTimeIncrementalLerp(
			this.offsetLerp ? this.offsetLerp() : Vector(6, 30),
			Vector(4, 22),
			pressDuration,
			easeIn
		);
		this.moveLerp = makeFixedTimeIncrementalLerp(
			this.movePos,
			target,
			pressDuration,
			easeIn
		);

		await new Promise((resolve) => setTimeout(resolve, pressDuration));

		item.press();

		this.scaleLerp = makeFixedTimeIncrementalLerp(
			item.baseLayer / this.baseLayer,
			1,
			pressDuration,
			easeOut
		);
		this.offsetLerp = makeFixedTimeIncrementalLerp(
			Vector(4, 22),
			Vector(6, 30),
			pressDuration,
			easeOut
		);

		this._state.act(PAW_NEXT_ACTION);
		this.replayMove();
	}

	async tap(point: Vector) {
		if (!this._state.can(PAW_TAP_ACTION)) return;
		this._state.act(PAW_TAP_ACTION);

		const tapDuration = 75;
		this.scaleLerp = makeFixedTimeIncrementalLerp(1, 0.8, tapDuration, easeIn);

		await new Promise((resolve) => setTimeout(resolve, tapDuration));

		this.scaleLerp = makeFixedTimeIncrementalLerp(0.8, 1, tapDuration, easeOut);
	}

	idle() {
		if (!this._state.can(PAW_IDLE_ACTION)) return;
		this._state.act(PAW_IDLE_ACTION);

		const resetDuration = 200;
		if (this.offsetLerp) {
			this.offsetLerp = makeFixedTimeIncrementalLerp(
				this.offsetLerp(),
				ZERO,
				resetDuration,
				easeInOut
			);
		}
		this.nailLerp = makeFixedTimeIncrementalLerp(
			Vector(0, -7.5),
			ZERO,
			resetDuration,
			easeIn
		);
		this.scaleLerp = makeFixedTimeIncrementalLerp(
			this.paw.scale,
			1,
			resetDuration,
			easeInOut
		);
	}

	async point() {
		if (!this._state.can(PAW_POINT_ACTION)) return;
		this._state.act(PAW_POINT_ACTION);

		const pointDuration = 200;
		const nailDelay = 150;
		const nailDuration = 150;

		this.offsetLerp = makeFixedTimeIncrementalLerp(
			this.offsetLerp ? this.offsetLerp() : ZERO,
			Vector(6, 30),
			pointDuration,
			easeInOut
		);

		await new Promise((resolve) => setTimeout(resolve, nailDelay));

		if (this._state.hasTag(PAW_POINTING_TAG)) {
			this.nailLerp = makeFixedTimeIncrementalLerp(
				this.nailLerp ? this.nailLerp() : ZERO,
				Vector(0, -7.5),
				nailDuration,
				easeOut
			);
		}
	}

	async drop(dropTarget: DropTargetInterface, point: Vector) {
		const item = this.heldItem;
		if (!this._state.can(PAW_DROP_ACTION) || !item) return;
		this._state.act(PAW_DROP_ACTION);

		this.heldItem = null;

		const dropStage1Duration = 100;
		const dropStage2Duration = 100;
		const dropStage3Duration = 200;

		let target = dropTarget.getDropPoint(point);
		if (canDrift(dropTarget)) {
			target = target.add(
				Vector(1, 0).mul((dropTarget.vel * dropStage1Duration) / 1000)
			);
		}
		const anticipationOffset = Vector(0, 40);

		this.moveLerp = makeFixedTimeIncrementalLerp(
			this.paw.pos,
			target,
			dropStage1Duration,
			easeInOut
		);

		this.scaleLerp = makeFixedTimeIncrementalLerp(
			this.paw.scale,
			dropTarget.layer / this.baseLayer,
			dropStage1Duration,
			easeInOut
		);

		await new Promise((resolve) => setTimeout(resolve, dropStage1Duration));

		item.pos = target.diff(item.center);
		item.scale = dropTarget.layer / item.baseLayer;

		item.drop?.(dropTarget);
		this.stagingArea.addChild(item);
		if (canDrift(dropTarget)) {
			item.vel = dropTarget.vel;
		}

		this.offsetLerp = makeFixedTimeIncrementalLerp(
			ZERO,
			anticipationOffset,
			dropStage2Duration,
			easeInOut
		);

		await new Promise((resolve) => setTimeout(resolve, dropStage2Duration));

		if (canDrift(dropTarget) && !dropTarget.still) {
			item.vel = 0;
		}
		Object.assign(item, dropTarget.project(item));
		dropTarget.host?.(item);
		dropTarget.addChild(item);

		this.graphic.isFaceUp = false;

		this._state.act(PAW_NEXT_ACTION);

		this.offsetLerp = makeFixedTimeIncrementalLerp(
			anticipationOffset,
			ZERO,
			dropStage3Duration,
			easeInOut
		);

		this.scaleLerp = makeFixedTimeIncrementalLerp(
			this.paw.scale,
			1,
			dropStage3Duration,
			easeInOut
		);
	}

	async pickup(item: PickupableInterface) {
		if (!this._state.can(PAW_PICKUP_ACTION)) return;
		this._state.act(PAW_PICKUP_ACTION);

		this.heldItem = item;

		const pickupStage1Duration = 100;
		const pickupStage2Duration = 100;
		const pickupStage3Duration = 200;

		let target = item.toGlobal(item.center);
		if (canDrift(item)) {
			target = target.add(
				Vector(1, 0).mul(
					(item.vel * (pickupStage1Duration + pickupStage2Duration)) / 1000
				)
			);
		}
		const anticipationOffset = Vector(0, 40);

		this.moveLerp = makeFixedTimeIncrementalLerp(
			this.paw.pos,
			target,
			pickupStage1Duration + pickupStage2Duration,
			easeInOut
		);

		this.offsetLerp = makeFixedTimeIncrementalLerp(
			ZERO,
			anticipationOffset,
			pickupStage1Duration,
			easeInOut
		);

		const itemCurrentLayer = item.scale * item.baseLayer;
		const targetScale = itemCurrentLayer / this.baseLayer;

		this.scaleLerp = makeFixedTimeIncrementalLerp(
			this.paw.scale,
			targetScale,
			pickupStage1Duration,
			easeInOut
		);

		await new Promise((resolve) => setTimeout(resolve, pickupStage1Duration));

		Object.assign(item, this.game.root.project(item));
		this.stagingArea.addChild(item);

		this.graphic.isFaceUp = true;

		this.offsetLerp = makeFixedTimeIncrementalLerp(
			anticipationOffset,
			ZERO,
			pickupStage2Duration,
			easeInOut
		);

		await new Promise((resolve) => setTimeout(resolve, pickupStage2Duration));

		if (canDrift(item)) {
			item.vel = 0;
		}

		const ratioWithItem = this.baseLayer / item.baseLayer;
		item.scale = ratioWithItem;
		item.pos = item.center.mul(-1);
		item.pickup?.();
		this.paw.addChild(item);

		this._state.act(PAW_CARRY_ACTION);

		this.scaleLerp = makeFixedTimeIncrementalLerp(
			this.paw.scale,
			1,
			pickupStage3Duration,
			easeInOut
		);

		this.replayMove();
	}

	override update(deltaT: number) {
		if (this.moveLerp) {
			this.paw.pos = this.movePos = this.moveLerp(deltaT);
		}

		if (this.nailLerp) {
			this.nail.pos = this.graphic.pos.add(this.nailLerp(deltaT));
		}

		if (this.offsetLerp) {
			this.paw.pos = this.paw.pos.add(this.offsetLerp(deltaT));
		}

		if (this.scaleLerp) {
			this.paw.scale = this.scaleLerp(deltaT);
		}
	}
}
