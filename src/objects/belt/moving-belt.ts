import { diContainer } from "../../core/di-container";
import { Game } from "../../core/game";
import { GameObject, GameObjectArgs } from "../../core/game-object";
import { CENTER, Vector } from "../../core/vector";
import { Driftable } from "../../systems/drift/drift.system";
import { DropTargetInterface } from "../../systems/interactable/interactable.types";
export type MovingBeltArgs = GameObjectArgs;

export class MovingBelt
	extends GameObject
	implements DropTargetInterface, Driftable
{
	game: Game;

	vel = 25;
	still = true;

	layer = 0.4;
	readonly canHost = true;
	origin = CENTER;

	constructor(args: GameObjectArgs) {
		super(args);
		this.game = diContainer.get(Game);
	}

	getDropPoint(this: GameObject, point: Vector): Vector {
		return this.toGlobal(Vector(point.x, (this.size.y - 10) / 2));
	}
}
