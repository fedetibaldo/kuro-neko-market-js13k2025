import { diContainer } from "../core/di-container";
import { Game } from "../core/game";
import { GameObject } from "../core/game-object";
import { Input } from "../core/input";
import { Vector } from "../core/vector";
import { immutableReverse } from "../utils/immutable-reverse";
import { CatPaw } from "./cat-paw";
import { Fish } from "./fish/fish";
import { Table } from "./table";

export class Level extends GameObject {
	game: Game;
	input: Input;
	paw: CatPaw;
	fishes: GameObject;

	returnPosition = Vector.ZERO;

	constructor() {
		super();

		this.game = diContainer.get(Game);
		this.input = diContainer.get(Input);

		this.paw = new CatPaw();
		this.fishes = new GameObject();

		this.input.on("mousedown", this.onMouseDown);
		this.paw.on("borrow", this.onBorrow);
		this.paw.on("return", this.onReturn);

		this.addChildren([
			new Table({
				pos: new Vector(0, this.game.viewRes.y - 90),
				size: new Vector(this.game.viewRes.x, 90),
			}),
			this.fishes,
			this.paw,
		]);

		this.addFish(
			new Fish({
				pos: new Vector(20, 155),
				origin: Vector.CENTER,
				rotation: (-Math.PI / 4) * 3,
			})
		);
		this.addFish(
			new Fish({
				pos: new Vector(60, 150),
				origin: Vector.CENTER,
				rotation: (Math.PI / 4) * 3,
				flipH: true,
			})
		);
	}

	onBorrow = (fish: Fish) => {
		this.fishes.removeChild(fish);
	};

	onReturn = (fish: Fish) => {
		fish.scale = 1;
		fish.pos = this.returnPosition;
		this.addFish(fish);
	};

	addFish(fish: Fish) {
		this.fishes.addChild(fish);
	}

	onMouseDown = () => {
		if (this.paw.isHoldingFish) {
			this.returnPosition = this.input.mousePos.diff(
				this.paw.heldFish!.size.mul(1 / 2)
			);
			return this.paw.putDown(this.input.mousePos);
		}

		for (const child of immutableReverse(this.fishes.children)) {
			if (child.isPointWithinObject(this.input.mousePos)) {
				return this.paw.pickUp(child as Fish);
			}
		}

		this.paw.tapGround();
	};
}
