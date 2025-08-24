import { walk } from "../utils/walk";
import { GameObjectData } from "./game-object-data";
import { diContainer } from "./di-container";
import { Game } from "./game";
import { UpdatableInterface } from "./update.types";

export class UpdateServer {
	game: Game;

	constructor() {
		this.game = diContainer.get(Game);
		this.game.on("tick", (deltaT: number) => this.update(deltaT));
	}

	update(deltaT: number) {
		const isUpdatable = (obj: object): obj is UpdatableInterface =>
			"update" in obj;

		if (!this.game.root) return;

		walk<GameObjectData>(this.game.root, (obj) => {
			if (isUpdatable(obj)) {
				if (obj.frozen) {
					return [];
				}
				obj.update(deltaT);
			}
			return obj.children;
		});
	}
}
