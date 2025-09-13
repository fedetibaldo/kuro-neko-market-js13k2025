import { walk } from "../utils/walk";
import { GameObjectData } from "./game-object-data";
import { diContainer } from "./di-container";
import { Game, GAME_TICK_EVENT } from "./game";
import { UpdatableInterface } from "./update.types";

export const isUpdatable = (obj: object): obj is UpdatableInterface =>
	!!(obj as any).update;

export class UpdateServer {
	game: Game;

	constructor() {
		this.game = diContainer.get(Game);
		this.game.on(GAME_TICK_EVENT, (deltaT: number) => this.update(deltaT));
	}

	update(deltaT: number) {
		this.game.root &&
			walk<GameObjectData>(this.game.root, (obj) => {
				if (isUpdatable(obj)) {
					if (obj.frozen) {
						return [];
					}
					obj.update(deltaT);
				}
				return obj.heirs;
			});
	}
}
