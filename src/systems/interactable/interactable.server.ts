import { GameObjectData } from "../../core/game-object-data";
import { diContainer } from "../../core/di-container";
import { Game } from "../../core/game";
import { InputServer } from "../../core/input.server";
import { Observable } from "../../core/observable";
import { Vector, ZERO } from "../../core/vector";
import { immutableReverse } from "../../utils/immutable-reverse";
import { walk } from "../../utils/walk";
import {
	DropTargetInterface,
	PickupableInterface,
	PressableInterface,
} from "./interactable.types";

export type MoveEvent = {
	hoveredItem: PressableInterface | PickupableInterface | null;
	point: Vector;
};

export type ClickEvent = {
	item: PressableInterface | PickupableInterface | null;
	dropTargets: DropTargetInterface[];
	point: Vector;
};

export const isPressable = (obj: object): obj is PressableInterface =>
	typeof (obj as any).canBePressed != "undefined";
export const isPickupable = (obj: object): obj is PickupableInterface =>
	typeof (obj as any).canBePickedUp != "undefined";
export const isDropTarget = (obj: object): obj is DropTargetInterface =>
	typeof (obj as any).canHost != "undefined";

export class InteractableServer extends Observable {
	game: Game;
	input: InputServer;

	hoveredItem: PressableInterface | PickupableInterface | null = null;
	hoveredDropTargets: DropTargetInterface[] = [];

	constructor() {
		super();
		this.game = diContainer.get(Game);
		this.input = diContainer.get(InputServer);
		this.game.on("tick", () => this.move());
		this.input.on("mousedown", () => this.click());
	}

	click() {
		this.trigger("click", {
			item: this.hoveredItem,
			dropTargets: this.hoveredDropTargets,
			point: this.input.mousePos,
		} satisfies ClickEvent);
	}

	move() {
		if (
			!this.input.mousePos.gt(ZERO) ||
			!this.input.mousePos.lt(this.game.root.size)
		) {
			this.hoveredItem = null;
			this.hoveredDropTargets = [];
		} else {
			const activeItems: (PressableInterface | PickupableInterface)[] = [];
			const passiveItems: DropTargetInterface[] = [];

			walk<GameObjectData>(this.game.root, (obj) => {
				if (isPressable(obj) || (isPickupable(obj) && obj.canBePickedUp)) {
					activeItems.push(obj);
				}
				if (isDropTarget(obj)) {
					passiveItems.push(obj);
				}
				return obj.children;
			});

			this.hoveredItem =
				immutableReverse(activeItems).find((item) =>
					item.isPointWithinObject(this.input.mousePos)
				) ?? null;

			this.hoveredDropTargets = immutableReverse(passiveItems).filter((item) =>
				item.isPointWithinObject(this.input.mousePos)
			);
		}

		this.trigger("move", {
			hoveredItem: this.hoveredItem,
			point: this.input.mousePos,
		} satisfies MoveEvent);
	}
}
