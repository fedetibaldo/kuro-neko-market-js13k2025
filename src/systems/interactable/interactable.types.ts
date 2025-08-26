import { GameObject } from "../../core/game-object";
import { Vector } from "../../core/vector";

export type TouchableInterface = GameObject & {
	baseLayer: number;
};

export type PickupableInterface = TouchableInterface & {
	canBePickedUp: true;
	center: Vector;
	pickup?(): void;
	drop?(): void;
};

export type PressableInterface = TouchableInterface & {
	canBePressed: true;
	getPressPoint(point: Vector): Vector;
	press: () => void;
};

export type DropTargetInterface = TouchableInterface & {
	canHost: true;
	getDropPoint(point: Vector): Vector;
};

export type InteractableInterface =
	| PickupableInterface
	| PressableInterface
	| DropTargetInterface;
