import { diContainer } from "../core/di-container";
import { Game } from "../core/game";
import { GameObject } from "../core/game-object";
import { Input } from "../core/input";
import { Vector } from "../core/vector";
import { clamp } from "../utils/clamp";
import { immutableReverse } from "../utils/immutable-reverse";
import { range } from "../utils/range";
import { CatPaw } from "./cat-paw";
import { Fish } from "./fish/fish";
import { Printer } from "./printer";
import { Table } from "./table";

class ConveyorBelt extends GameObject {
	render(ctx: CanvasRenderingContext2D) {
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
		super.render(ctx);
	}
}

export class Level extends GameObject {
	game: Game;
	input: Input;
	paw: CatPaw;
	fishes: GameObject;
	fishStagingArea: GameObject;

	table: GameObject;
	belt: GameObject;

	returnPosition = Vector.ZERO;

	constructor() {
		super();

		this.game = diContainer.get(Game);
		this.input = diContainer.get(Input);

		this.paw = new CatPaw();
		this.fishes = new GameObject();

		this.input.on("mousedown", this.onMouseDown);
		this.paw.on("preborrow", this.onPreBorrow);
		this.paw.on("borrow", this.onBorrow);
		this.paw.on("predrop", this.onPreDrop);
		this.paw.on("drop", this.onDrop);

		this.belt = new ConveyorBelt({
			pos: new Vector(0, 110),
			size: new Vector(this.game.viewRes.x, 50),
		});

		this.table = new Table({
			pos: new Vector(0, this.game.viewRes.y - 90),
			size: new Vector(this.game.viewRes.x, 90),
		});

		this.fishStagingArea = new GameObject();

		this.addChildren([
			this.belt,
			this.table,
			new Printer({ pos: new Vector(270, 163) }),
			this.fishes,
			this.paw,
			this.fishStagingArea,
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

	onPreBorrow = (fish: Fish) => {
		this.fishes.removeChild(fish);
		this.fishStagingArea.addChild(fish);
	};

	onBorrow = (fish: Fish) => {
		this.fishStagingArea.removeChild(fish);
	};

	tableDepth = 0.25;
	beltDepth = 0.6;

	onPreDrop = (fish: Fish) => {
		const depth = this.table.isPointWithinObject(
			this.returnPosition.add(fish.size.mul(1 / 2))
		)
			? this.tableDepth
			: this.beltDepth;
		fish.graphic.scale = (1 - depth) / 0.75;
		fish.pos = this.returnPosition;
		this.fishStagingArea.addChild(fish);
	};

	onDrop = () => {
		const fish = this.fishStagingArea.children.at(0)!;
		this.fishStagingArea.removeChild(fish);
		this.addFish(fish as Fish);
	};

	addFish(fish: Fish) {
		this.fishes.addChild(fish);
	}

	onMouseDown = () => {
		const clickPos = this.input.mousePos;

		const tableWasClicked = this.table.isPointWithinObject(clickPos);
		const beltWasClicked = this.belt.isPointWithinObject(clickPos);

		if (!tableWasClicked && !beltWasClicked) {
			return;
		}

		const depth = tableWasClicked ? this.tableDepth : this.beltDepth;

		if (this.paw.isHoldingFish) {
			const fish = this.paw.heldFish!;
			const halfFishSize = fish.size.mul(1 / 2);

			const snappedPos = clickPos;
			if (beltWasClicked) {
				snappedPos.y =
					this.belt.getGlobalPosition().y + this.belt.size.y / 2 - 2;
			}
			if (tableWasClicked) {
				const tableYStart = this.table.getGlobalPosition().y;
				const tableYEnd = tableYStart + this.table.size.y;
				const fourthFishHeight = halfFishSize.y / 2;
				const halfFishWidth = halfFishSize.x;
				snappedPos.y = clamp(
					snappedPos.y,
					tableYStart + fourthFishHeight,
					tableYEnd - fourthFishHeight
				);
				snappedPos.x = clamp(
					snappedPos.x,
					0 + halfFishWidth,
					this.game.viewRes.x - halfFishWidth
				);
			}
			this.returnPosition = snappedPos.diff(halfFishSize);
			return this.paw.putDown(clickPos, depth);
		}

		for (const child of immutableReverse(this.fishes.children)) {
			if (child.isPointWithinObject(clickPos)) {
				return this.paw.pickUp(child as Fish, depth, 1 / 0.75);
			}
		}

		this.paw.tapGround();
	};
}
