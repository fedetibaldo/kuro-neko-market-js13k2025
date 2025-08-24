import { diContainer } from "./di-container";
import { DisplayServer } from "./display.server";
import { Game } from "./game";
import { Observable } from "./observable";
import { Vector } from "./vector";

export type NormalizedTouchEvent = TouchEvent & {
	clientX: number;
	clientY: number;
	isTouchEvent: true;
};

export class InputServer extends Observable {
	displayServer: DisplayServer;
	game: Game;

	mousePos = Vector.ZERO;
	isScrolling = false;
	isMouseDown = false;
	isTouchDevice = false;

	initialDragPoint: Vector | undefined;
	lastDragPoint: Vector | undefined;
	stopMomentum: (() => void) | undefined;
	lastDelta: Vector | undefined;

	scrollVelocity = 5;
	sensitivity = 2;

	constructor() {
		super();
		this.game = diContainer.get(Game);
		this.displayServer = diContainer.get(DisplayServer);

		const canvas = this.displayServer.canvas;

		canvas.addEventListener("mousedown", (e) => this.onCanvasMouseDown(e));
		canvas.addEventListener("mouseup", (e) => this.onCanvasMouseUp(e));
		canvas.addEventListener("mousemove", (e) => this.onCanvasMouseMove(e));

		canvas.addEventListener("touchstart", (e) => this.onCanvasTouchStart(e));
		canvas.addEventListener("touchend", (e) => this.onCanvasTouchEnd(e));
		canvas.addEventListener("touchmove", (e) => this.onCanvasTouchMove(e));

		canvas.addEventListener("wheel", (e) => this.onCanvasWheel(e));
	}

	onCanvasTouchStart(e: TouchEvent) {
		this.onCanvasMouseDown(this._normalizeTouchEvent(e));
	}

	onCanvasTouchEnd(e: TouchEvent) {
		this.onCanvasMouseUp(this._normalizeTouchEvent(e));
	}

	onCanvasTouchMove(e: TouchEvent) {
		this.onCanvasMouseMove(this._normalizeTouchEvent(e));
	}

	_normalizeTouchEvent(e: TouchEvent): NormalizedTouchEvent {
		this.isTouchDevice = true;
		return {
			...e,
			clientX: e.changedTouches[0]?.clientX ?? 0,
			clientY: e.changedTouches[0]?.clientY ?? 0,
			isTouchEvent: true,
		};
	}

	onCanvasMouseDown(e: MouseEvent | NormalizedTouchEvent) {
		this.isMouseDown = true;
		this.lastDragPoint = this.initialDragPoint = this.projectPosition(
			this.eventToVector(e)
		);
		this.stopMomentum && this.stopMomentum();
		this.triggerMouseEvent("mousedown", e);
	}

	onCanvasMouseUp(e: MouseEvent | NormalizedTouchEvent) {
		this.isMouseDown = false;
		this.triggerMouseEvent("mouseup", e);
		if (this.isScrolling) {
			this.stopMomentum = this.game.on("tick", (deltaT: number) => {
				const delta = (this.lastDelta = this.lastDelta!.diff(
					this.lastDelta!.mul(this.scrollVelocity * (deltaT / 1000))
				));
				this.trigger("scroll", { delta });
				if (delta.length() < 0.1) {
					this.stopMomentum && this.stopMomentum();
				}
			});
		}
		this.isScrolling = false;
	}

	onCanvasMouseMove(e: MouseEvent | NormalizedTouchEvent) {
		this.triggerMouseEvent("mousemove", e);
		if (this.isMouseDown) {
			const newDragPoint = this.projectPosition(this.eventToVector(e));
			if (!this.isScrolling && this.initialDragPoint) {
				const deltaFromStart = newDragPoint.diff(this.initialDragPoint);
				if (deltaFromStart.length() > this.sensitivity) {
					this.isScrolling = true;
				}
			}
			if (this.isScrolling && this.lastDragPoint) {
				const delta = newDragPoint.diff(this.lastDragPoint);
				this.lastDelta = delta;
				this.lastDragPoint = newDragPoint;
				this.trigger("scroll", { delta });
			}
		}
	}

	onCanvasWheel(e: WheelEvent) {
		const delta = (
			e.shiftKey ? new Vector(e.deltaY, 0) : new Vector(0, e.deltaY)
		)
			.mul(this.scrollVelocity)
			.mul(-1);
		// const delta = dir.mul(this.scrollVelocity)
		this.trigger("scroll", { delta });
	}

	triggerMouseEvent(name: string, e: MouseEvent | NormalizedTouchEvent) {
		if (!("isTouchEvent" in e) && this.isTouchDevice) {
			return;
		}
		const pos = this.projectPosition(this.eventToVector(e));
		this.mousePos = pos;
		this.trigger(name, { pos });
	}

	eventToVector(e: { clientX: number; clientY: number }) {
		return new Vector(e.clientX, e.clientY);
	}

	projectPosition(pos: Vector) {
		const { viewPos, viewRes, viewSize } = this.displayServer;
		const clickPos = pos.diff(viewPos);
		clickPos.x = (clickPos.x * viewRes.x) / viewSize.x;
		clickPos.y = (clickPos.y * viewRes.y) / viewSize.y;
		return clickPos;
	}
}
