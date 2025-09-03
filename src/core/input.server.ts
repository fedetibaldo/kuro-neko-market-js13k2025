import { diContainer } from "./di-container";
import { DisplayServer } from "./display.server";
import { Game, GAME_TICK_EVENT } from "./game";
import { Observable } from "./observable";
import { unique } from "./unique";
import { Vector, ZERO } from "./vector";

export type NormalizedTouchEvent = TouchEvent & {
	clientX: number;
	clientY: number;
	isTouchEvent: true;
};

export const INPUT_SCROLL_EVENT = unique();
export const INPUT_MOUSEDOWN_EVENT = unique();
export const INPUT_MOUSEUP_EVENT = unique();
export const INPUT_MOUSEMOVE_EVENT = unique();

export class InputServer extends Observable {
	displayServer: DisplayServer;
	game: Game;

	mousePos = ZERO;
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

		canvas.onmousedown = (e) => this.onCanvasMouseDown(e);
		canvas.onmouseup = (e) => this.onCanvasMouseUp(e);
		canvas.onmousemove = (e) => this.onCanvasMouseMove(e);

		canvas.ontouchstart = (e) => this.onCanvasTouchStart(e);
		canvas.ontouchend = (e) => this.onCanvasTouchEnd(e);
		canvas.ontouchmove = (e) => this.onCanvasTouchMove(e);

		canvas.onwheel = (e) => this.onCanvasWheel(e);
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
		this.triggerMouseEvent(INPUT_MOUSEDOWN_EVENT, e);
	}

	onCanvasMouseUp(e: MouseEvent | NormalizedTouchEvent) {
		this.isMouseDown = false;
		this.triggerMouseEvent(INPUT_MOUSEUP_EVENT, e);
		if (this.isScrolling) {
			this.stopMomentum = this.game.on(GAME_TICK_EVENT, (deltaT: number) => {
				const delta = (this.lastDelta = this.lastDelta!.diff(
					this.lastDelta!.mul(this.scrollVelocity * (deltaT / 1000))
				));
				this.trigger(INPUT_SCROLL_EVENT, { delta });
				if (delta.length() < 0.1) {
					this.stopMomentum && this.stopMomentum();
				}
			});
		}
		this.isScrolling = false;
	}

	onCanvasMouseMove(e: MouseEvent | NormalizedTouchEvent) {
		this.triggerMouseEvent(INPUT_MOUSEMOVE_EVENT, e);
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
				this.trigger(INPUT_SCROLL_EVENT, { delta });
			}
		}
	}

	onCanvasWheel(e: WheelEvent) {
		const delta = (e.shiftKey ? Vector(e.deltaY, 0) : Vector(0, e.deltaY))
			.mul(this.scrollVelocity)
			.mul(-1);
		// const delta = dir.mul(this.scrollVelocity)
		this.trigger(INPUT_SCROLL_EVENT, { delta });
	}

	triggerMouseEvent(name: symbol, e: MouseEvent | NormalizedTouchEvent) {
		if (!("isTouchEvent" in e) && this.isTouchDevice) {
			return;
		}
		const pos = this.projectPosition(this.eventToVector(e));
		this.mousePos = pos;
		this.trigger(name, { pos });
	}

	eventToVector(e: { clientX: number; clientY: number }) {
		return Vector(e.clientX, e.clientY);
	}

	projectPosition(pos: Vector) {
		const { viewPos, viewRes, viewSize } = this.displayServer;
		let clickPos = pos.diff(viewPos);
		clickPos = clickPos.mulv(viewRes).mulv(viewSize.oneOver());
		return clickPos;
	}
}
