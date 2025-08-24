import { diContainer } from "./di-container";
import { GameObject } from "./game-object";
import { InputServer } from "./input.server";

export class Area extends GameObject {
	input = diContainer.get(InputServer);

	isInside = false;
	isPressed = false;
	listeners = [
		this.input.on("mouseup", (e: any) => this.onMouseEvent("mouseup", e)),
		this.input.on("mousedown", (e: any) => this.onMouseEvent("mousedown", e)),
		this.input.on("mousemove", (e: any) => this.onMouseEvent("mousemove", e)),
	];

	destroy() {
		super.destroy();
		this.listeners.forEach((sub) => sub());
		this.listeners = [];
	}

	onMouseEvent(name: string, event: any) {
		if (!this.isFrozen() && this.isPointWithinObject(event.pos)) {
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
}
