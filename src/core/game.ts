import { Observable } from "./observable";
import { Vector } from "./vector";
import { Viewport } from "./viewport";

export class Game extends Observable {
	root: Viewport;
	oldT: number;

	constructor({ viewRes }: { viewRes: Vector }) {
		super();
		this.oldT = 0;
		this.root = new Viewport({ size: viewRes });
	}

	loop(newT: number) {
		window.requestAnimationFrame((newT) => this.loop(newT));
		if (this.root) {
			if (this.oldT) {
				const deltaT = newT - this.oldT;
				this.trigger("tick", deltaT);
			}
			this.oldT = newT;
		}
	}

	play() {
		window.requestAnimationFrame((newT) => this.loop(newT));
	}
}
