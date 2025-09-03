import { unique } from "./unique";
import { Observable } from "./observable";
import { Vector } from "./vector";
import { Viewport } from "./viewport";

export const GAME_TICK_EVENT = unique();

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
				this.trigger(GAME_TICK_EVENT, deltaT);
			}
			this.oldT = newT;
		}
	}

	play() {
		window.requestAnimationFrame((newT) => this.loop(newT));
	}
}
