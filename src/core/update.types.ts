import { GameObjectData } from "./game-object-data";

export type UpdatableInterface = GameObjectData & {
	update(deltaT: number): void;
	frozen: boolean;
};
