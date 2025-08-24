import { Vector } from "./vector";

export type GameObjectData = {
	parent: GameObjectData | undefined;
	pos: Vector;
	size: Vector;
	scale: number;
	rotation: number;
	children: GameObjectData[];
	origin: Vector;
	opacity: number;
};
