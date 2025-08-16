import { diContainer } from "./di-container";
import { GameObject } from "./game-object";
import { Input } from "./input";
import { Vector } from "./vector";

export class Area extends GameObject {
	isInside: boolean;
	isPressed: boolean;
	listeners: Function[];
	input = diContainer.get(Input);

	constructor({ size = new Vector(), ...options }) {
		super({ size, ...options });

		this.isInside = false;
		this.isPressed = false;

		// event listeners
		this.listeners = [
			this.input.on("mouseup", (e: any) => this.onMouseEvent("mouseup", e)),
			this.input.on("mousedown", (e: any) => this.onMouseEvent("mousedown", e)),
			this.input.on("mousemove", (e: any) => this.onMouseEvent("mousemove", e)),
		];
	}
	destroy() {
		super.destroy();
		this.listeners.forEach((sub) => sub());
		this.listeners = [];
	}
	onMouseEvent(name: string, event: any) {
		if (!this.isFreezed() && this.isPointWithinObject(event.pos)) {
			if (!this.isInside) {
				this.trigger("mouseenter", event);
				this.isInside = true;
			}
			if (name == "mousedown") {
				this.isPressed = true;
			}
			this.trigger(name, event);
			if (name == "mouseup" && this.isPressed) {
				if (!this.input.isScrolling) {
					this.trigger("click", event);
				}
				this.isPressed = false;
			}
		} else {
			if (this.isInside) {
				this.trigger("mouseexit", event);
				this.isPressed = false;
			}
			this.isInside = false;
		}
	}
	isPointWithinObject(point: Vector) {
		const gPos = this.getGlobalPosition();
		const { x, y } = gPos;
		const { x: w, y: h } = gPos.add(this.size);
		return point.x > x && point.x < w && point.y > y && point.y < h;
	}
}
