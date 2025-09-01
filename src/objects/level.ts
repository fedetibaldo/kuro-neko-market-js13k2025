import { diContainer } from "../core/di-container";
import { Game } from "../core/game";
import { GameObject, GameObjectArgs } from "../core/game-object";
import { Vector } from "../core/vector";
import { FishType, fishTypes } from "../data/fish-types";
import { DropTargetInterface } from "../systems/interactable/interactable.types";
import {
	chaosStrategy,
	chooseFish,
	easyStrategy,
	hardStrategy,
	mediumStrategy,
} from "../utils/choose-fish";
import { chooseVariants, VariantChoices } from "../utils/choose-variants";
import { clamp } from "../utils/clamp";
import { chance } from "../utils/random";
import { Belt, BeltShadow } from "./belt";
import { Fish } from "./fish/fish";
import { Notebook } from "./notebook";
import { Paw } from "./paw/paw";
import { Printer } from "./printer/printer";
import { Sea } from "./sea";
import { Sky } from "./sky";
import { Table } from "./table";

type LevelArgs = GameObjectArgs & {
	difficulty: 0 | 1 | 2 | 3;
};

export class Level extends GameObject {
	isFirst = true;
	t = 0;
	tToSpawn: number;
	difficulty: 0 | 1 | 2 | 3;
	levelFishTypes: FishType[];
	levelVariants: VariantChoices[];

	spawnFish(type: FishType) {
		const flipH = chance(1 / 2);
		const belt = this.getChild("belt")! as DropTargetInterface;
		const fish = new Fish({
			flipH,
			rotation: (-Math.PI / 4) * 3 * (flipH ? -1 : 1),
			type,
		});
		fish.pos = belt
			.toLocal(belt.getDropPoint(Vector(-30, 0)))
			.diff(fish.size.mulv(fish.origin));
		fish.scale = belt.layer / fish.baseLayer;
		belt.addChild(fish);
	}

	update(deltaT: number): void {
		if (this.isFirst && this.difficulty < 3) {
			this.spawnFish(this.levelFishTypes.at(-1)!);
			this.isFirst = false;
		}

		const strategies = [
			easyStrategy,
			mediumStrategy,
			hardStrategy,
			chaosStrategy,
		];

		this.t += deltaT / 1000;
		const shouldSpawn = this.t >= this.tToSpawn;
		if (shouldSpawn) {
			this.t = 0;
			this.spawnFish(
				chooseFish(
					this.levelFishTypes,
					this.levelVariants,
					strategies[this.difficulty]!
				)
			);
		}
	}

	constructor({ difficulty, ...rest }: LevelArgs) {
		super(rest);
		this.difficulty = difficulty;

		const game = diContainer.get(Game);

		const velocity = 30; // px / s
		const time = 120;
		const timeToCrossScreen = game.root.size.x / velocity;
		const timeUntilLastSpawn = time - timeToCrossScreen;
		const spawns = 15 + difficulty * 3;
		this.tToSpawn = timeUntilLastSpawn / spawns;

		this.levelFishTypes = fishTypes.slice(0, difficulty + 1);
		this.levelVariants = chooseVariants(this.levelFishTypes);

		const beltSize = Vector(game.root.size.x, 40);
		const beltPosition = Vector(0, 110);

		const tableSize = Vector(game.root.size.x, 90);

		const seaSize = Vector(game.root.size.x, 30);
		const seaPosition = Vector(0, beltPosition.y - seaSize.y);

		this.addChildren([
			new Belt({
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
						fishTypes: this.levelFishTypes,
						chosenVariants: this.levelVariants,
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
					}),
				],
			}),

			new GameObject({
				id: "belt",
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
		]);
	}
}
