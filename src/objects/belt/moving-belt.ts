import { GameObject, GameObjectArgs } from "../../core/game-object";
import { CENTER, ONE, Vector, ZERO } from "../../core/vector";
import { Driftable } from "../../systems/drift/drift.system";
import { DropTargetInterface } from "../../systems/interactable/interactable.types";

export type MovingBeltArgs = GameObjectArgs;

export class MovingBelt
	extends GameObject
	implements DropTargetInterface, Driftable
{
	vel = 25;
	still = true;

	layer = 0.4;
	readonly canHost = true;
	origin = CENTER;

	addChild(child: GameObject, index?: number): void {
		super.addChild(child, index);
		child.pointCheckTolerance = ONE.mul(25);
	}
	removeChild(child: GameObject): void {
		super.removeChild(child);
		child.pointCheckTolerance = ZERO;
	}

	getDropPoint(this: GameObject, point: Vector): Vector {
		return this.toGlobal(Vector(point.x, (this.size.y - 10) / 2));
	}
}
