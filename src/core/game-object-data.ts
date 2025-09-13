import { Vector } from "./vector";

export type GameObjectData = {
	father: GameObjectData | undefined;
	pos: Vector;
	size: Vector;
	scale: number;
	rotation: number;
	heirs: GameObjectData[];
	origin: Vector;
	opacity: number;
};
