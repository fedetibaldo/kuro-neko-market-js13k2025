import { GameObject } from "../../core/game-object";
import { Vector } from "../../core/vector";

export type PickupableInterface = GameObject & {
	canBePickedUp: boolean;
	baseLayer: number;
	center: Vector;
	pickup?(): void;
	drop?(target: DropTargetInterface): void;
};

export type PressableInterface = GameObject & {
	baseLayer: number;
	canBePressed: true;
	getPressPoint(point: Vector): Vector;
	press: () => void;
};

export type DropTargetInterface = GameObject & {
	layer: number;
	canHost: true | ((obj: GameObject) => boolean);
	getDropPoint(point: Vector): Vector;
};

export type InteractableInterface =
	| PickupableInterface
	| PressableInterface
	| DropTargetInterface;
