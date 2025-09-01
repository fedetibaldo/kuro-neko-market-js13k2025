import { diContainer } from "../core/di-container";
import { Game } from "../core/game";
import { GameObject } from "../core/game-object";
import { InputServer } from "../core/input.server";
import { CENTER, Vector, ZERO } from "../core/vector";
import { fishTypes } from "../data/fish-types";
import { chooseFish, easyStrategy } from "../utils/choose-fish";
import { chooseVariants } from "../utils/choose-variants";
import { clamp } from "../utils/clamp";
import { Belt, BeltShadow } from "./belt";
import { Fish } from "./fish/fish";
import { Notebook } from "./notebook";
import { Paw } from "./paw/paw";
import { Printer } from "./printer/printer";
import { Sea } from "./sea";
import { Sky } from "./sky";
import { Table } from "./table";

export class Level extends GameObject {
	input = diContainer.get(InputServer);

	paw = this.getChild("paw") as Paw;
	table = this.getChild("table") as GameObject;
	belt = this.getChild("belt") as GameObject;
	printer = this.getChild("printer") as Printer;

	returnPosition = ZERO;

	createChildren() {
		const game = diContainer.get(Game);

		const beltSize = Vector(game.root.size.x, 40);
		const beltPosition = Vector(0, 110);

		const tableSize = Vector(game.root.size.x, 90);

		const seaSize = Vector(game.root.size.x, 30);
		const seaPosition = Vector(0, beltPosition.y - seaSize.y);

		const levelFishTypes = fishTypes.slice(0, 2);
		const levelVariants = chooseVariants(levelFishTypes);

		return [
			new Belt({
				id: "belt",
				pos: Vector(0, 110),
				size: beltSize,
			}),
			new Sky({
				size: Vector(game.root.size.x, seaPosition.y),
			}),
			new Sea({
				pos: seaPosition,
				size: seaSize,
			}),
			new Table({
				id: "table",
				pos: Vector(0, game.root.size.y - 90),
				size: tableSize,
				children: [
					new Notebook({
						pos: Vector(5, 23),
						fishTypes: levelFishTypes,
						chosenVariants: levelVariants,
					}),
					new Printer({
						id: "printer",
						pos: Vector(game.root.size.x - 90, 15),
					}),
					new GameObject({
						layer: 0.75,
						canHost: true,
						size: tableSize,
						getDropPoint(this: GameObject, point: Vector): Vector {
							const local = this.toLocal(point);
							const padding = 30;
							const clamped = Vector(
								clamp(local.x, padding, this.size.x - padding),
								clamp(local.y, padding, this.size.y - padding)
							);
							return this.toGlobal(clamped);
						},
						children: [
							new Fish({
								pos: Vector(95, 10),
								origin: CENTER,
								type: chooseFish(levelFishTypes, levelVariants, easyStrategy),
								rotation: (-Math.PI / 4) * 3,
							}),
							new Fish({
								type: chooseFish(levelFishTypes, levelVariants, easyStrategy),
								pos: Vector(130, 15),
								origin: CENTER,
								rotation: (Math.PI / 4) * 3,
								flipH: true,
							}),
							new Fish({
								type: chooseFish(levelFishTypes, levelVariants, easyStrategy),
								pos: Vector(180, 15),
								origin: CENTER,
								rotation: (Math.PI / 4) * 3,
								flipH: true,
							}),
						],
					}),
				],
			}),

			new GameObject({
				layer: 0.4,
				canHost: true,
				pos: beltPosition,
				size: beltSize,
				getDropPoint(this: GameObject, point: Vector): Vector {
					return this.toGlobal(Vector(point.x, (this.size.y - 10) / 2));
				},
				update(deltaT: number) {
					for (const child of this.children!) {
						child.pos = child.pos.add(Vector((deltaT / 1000) * 25, 0));
						if (child.pos.x > game.root.size.x) {
							child.destroy();
						}
					}
				},
			}),

			new BeltShadow({ pos: beltPosition, size: beltSize }),

			new Paw({ id: "paw" }),
		];
	}
}
