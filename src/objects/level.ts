import { diContainer } from "../core/di-container";
import { Game } from "../core/game";
import { GameObject } from "../core/game-object";
import { InputServer } from "../core/input.server";
import { CENTER, Vector, ZERO } from "../core/vector";
import { Belt, BeltShadow } from "./belt";
import { Fish } from "./fish/fish";
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
					new Printer({
						id: "printer",
						pos: Vector(game.root.size.x - 90, 15),
					}),
					new GameObject({
						layer: 0.75,
						canHost: true,
						size: tableSize,
						getDropPoint(point: Vector): Vector {
							return point;
						},
						children: [
							new Fish({
								pos: Vector(20, 10),
								origin: CENTER,
								rotation: Math.PI / 2,
								// rotation: (-Math.PI / 4) * 3,
							}),
							new Fish({
								pos: Vector(60, 15),
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
				getDropPoint(point: Vector): Vector {
					return point;
				},
			}),

			new BeltShadow({ pos: beltPosition, size: beltSize }),

			new Paw({ id: "paw" }),
		];
	}
}
