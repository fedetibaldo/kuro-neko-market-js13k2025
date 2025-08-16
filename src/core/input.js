import { Observable } from "./observable";
import { Vector } from "./vector";
import { Game } from "./game";
import { diContainer } from "./di-container";

export class Input extends Observable {
	constructor() {
		super();
		this.Game = diContainer.get(Game);

		this.isMouseDown = false;
		this.isTouchDevice = false;
		this.isScrolling = false;
		this.mousePos = new Vector(0, 0);
		this.scrollVelocity = 5;
		this.sensitivity = 2;

		this.lastDragPoint = null;

		this.Game.canvas.onmousedown = (e) => this.onCanvasMouseDown(e);
		this.Game.canvas.onmouseup = (e) => this.onCanvasMouseUp(e);
		this.Game.canvas.onmousemove = (e) => this.onCanvasMouseMove(e);

		this.Game.canvas.ontouchstart = (e) => this.onCanvasTouchStart(e);
		this.Game.canvas.ontouchend = (e) => this.onCanvasTouchEnd(e);
		this.Game.canvas.ontouchmove = (e) => this.onCanvasTouchMove(e);

		this.Game.canvas.onwheel = (e) => this.onCanvasWheel(e);
	}
	onCanvasTouchStart(e) {
		e = this._normalizeTouchEvent(e);
		this.onCanvasMouseDown(e);
	}
	onCanvasTouchEnd(e) {
		e = this._normalizeTouchEvent(e);
		this.onCanvasMouseUp(e);
	}
	onCanvasTouchMove(e) {
		e = this._normalizeTouchEvent(e);
		this.onCanvasMouseMove(e);
	}
	_normalizeTouchEvent(e) {
		this.isTouchDevice = true;
		e.clientX = e.changedTouches[0].clientX;
		e.clientY = e.changedTouches[0].clientY;
		e.isTouchEvent = true;
		return e;
	}
	onCanvasMouseDown(e) {
		this.isMouseDown = true;
		this.lastDragPoint = this.initialDragPoint = this.normalizePosition(
			this.eventToVector(e)
		);
		this.stopMomentum && this.stopMomentum();
		this.triggerMouseEvent("mousedown", e);
	}
	onCanvasMouseUp(e) {
		this.isMouseDown = false;
		this.triggerMouseEvent("mouseup", e);
		if (this.isScrolling) {
			this.stopMomentum = this.Game.on("tick", (deltaT) => {
				const delta = (this.lastDelta = this.lastDelta.diff(
					this.lastDelta.mul(this.scrollVelocity * (deltaT / 1000))
				));
				this.triggerEvent("scroll", { delta });
				if (delta.length() < 0.1) {
					this.stopMomentum();
				}
			});
		}
		this.isScrolling = false;
	}
	onCanvasMouseMove(e) {
		this.triggerMouseEvent("mousemove", e);
		if (this.isMouseDown) {
			const newDragPoint = this.normalizePosition(this.eventToVector(e));
			if (!this.isScrolling) {
				const deltaFromStart = newDragPoint.diff(this.initialDragPoint);
				if (deltaFromStart.length() > this.sensitivity) {
					this.isScrolling = true;
				}
			}
			if (this.isScrolling) {
				const delta = newDragPoint.diff(this.lastDragPoint);
				this.lastDelta = delta;
				this.lastDragPoint = newDragPoint;
				this.triggerEvent("scroll", { delta });
			}
		}
	}
	onCanvasWheel(e) {
		const delta = (
			e.shiftKey ? new Vector(e.deltaY, 0) : new Vector(0, e.deltaY)
		)
			.mul(this.scrollVelocity)
			.mul(-1);
		// const delta = dir.mul(this.scrollVelocity)
		this.triggerEvent("scroll", { delta });
	}
	triggerMouseEvent(name, e) {
		if (!e.isTouchEvent && this.isTouchDevice) {
			return;
		}
		const pos = this.normalizePosition(this.eventToVector(e));
		this.mousePos = pos;
		this.triggerEvent(name, { pos });
	}
	triggerEvent(name, args) {
		this.trigger(name, { name, ...args });
	}
	eventToVector(e) {
		return new Vector(e.clientX, e.clientY);
	}
	normalizePosition(pos) {
		const clickPos = pos.diff(this.Game.viewPos);
		clickPos.x = (clickPos.x * this.Game.viewRes.x) / this.Game.viewSize.x;
		clickPos.y = (clickPos.y * this.Game.viewRes.y) / this.Game.viewSize.y;
		return clickPos;
	}
}
