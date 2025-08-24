import { diContainer } from "../core/di-container";
import { Game } from "../core/game";
import { GameObject } from "../core/game-object";
import { InputServer } from "../core/input.server";
import { Vector } from "../core/vector";
import { DropTargetInterface } from "../systems/interactable/interactable.types";
import { range } from "../utils/range";
import { Fish } from "./fish/fish";
import { Paw } from "./paw/paw";
import { Printer } from "./printer/printer";
import { Table } from "./table";

class ConveyorBelt extends GameObject implements DropTargetInterface {
	readonly canHost = true;
	baseLayer = 0.4;

	getDropPoint(point: Vector): Vector {
		return point;
	}

	render(ctx: OffscreenCanvasRenderingContext2D) {
		ctx.fillStyle = "grey";
		ctx.fillRect(0, 10, this.size.x, this.size.y - 20);
		const radius = 10;
		for (const index of range(8)) {
			ctx.beginPath();
			ctx.arc(
				(this.size.x / 7) * index,
				this.size.y,
				radius,
				0,
				Math.PI * 2,
				true
			);
			ctx.fillStyle = "grey";
			ctx.fill();
		}
	}
}

export class Level extends GameObject {
	input = diContainer.get(InputServer);

	paw = this.getChild("paw") as Paw;
	table = this.getChild("table") as GameObject;
	belt = this.getChild("belt") as GameObject;
	printer = this.getChild("printer") as Printer;

	returnPosition = Vector.ZERO;

	createChildren() {
		const game = diContainer.get(Game);
		return [
			new ConveyorBelt({
				id: "belt",
				pos: new Vector(0, 110),
				size: new Vector(game.root.size.x, 50),
			}),
			new Table({
				id: "table",
				pos: new Vector(0, game.root.size.y - 90),
				size: new Vector(game.root.size.x, 90),
				children: [
					new Fish({
						pos: new Vector(20, 10),
						origin: Vector.CENTER,
						rotation: (-Math.PI / 4) * 3,
					}),
					new Fish({
						pos: new Vector(60, 15),
						origin: Vector.CENTER,
						rotation: (Math.PI / 4) * 3,
						flipH: true,
					}),
				],
			}),
			new Printer({ id: "printer", pos: new Vector(270, 163) }),
			new Paw({ id: "paw" }),
		];
	}
}
