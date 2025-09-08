import { diContainer } from "../../core/di-container";
import { Game, GAME_TICK_EVENT } from "../../core/game";
import { GameObject } from "../../core/game-object";
import { Observable } from "../../core/observable";
import { Vector } from "../../core/vector";
import { walk } from "../../utils/walk";

export type Driftable = {
	vel: number;
	still?: boolean;
};

export const canDrift = (obj: object): obj is Driftable => !!(obj as any).vel;

export class DriftSystem extends Observable {
	game: Game;

	constructor() {
		super();
		this.game = diContainer.get(Game);
		this.game.on(GAME_TICK_EVENT, (deltaT: number) => this.drift(deltaT));
	}

	drift(deltaT: number) {
		walk<GameObject>(this.game.root, (obj) => {
			if (obj.frozen) {
				return [];
			}
			if (canDrift(obj)) {
				if (!obj.still) {
					obj.pos = obj.pos.add(Vector(1, 0).mul((obj.vel * deltaT) / 1000));
					if (obj.pos.x > this.game.root.size.x) {
						obj.kill();
					}
				}
			}
			return obj.children;
		});
	}
}
