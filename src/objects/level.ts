import { diContainer } from "../core/di-container";
import { Flexbox } from "../core/flexbox";
import { Game } from "../core/game";
import { GameObject, GameObjectArgs } from "../core/game-object";
import { TOP_RIGHT, Vector } from "../core/vector";
import { FishType, fishTypes } from "../data/fish-types";
import { DropTargetInterface } from "../systems/interactable/interactable.types";
import {
	chaosStrategy,
	chooseFish,
	easyStrategy,
	hardStrategy,
	mediumStrategy,
} from "../utils/choose-fish";
import { chooseVariants, FishChosenVariants } from "../utils/choose-variants";
import { clamp } from "../utils/clamp";
import { chance } from "../utils/random";
import { Belt, BeltShadow } from "./belt";
import { MovingBelt } from "./belt/moving-belt";
import { CurrencySign } from "./currency-sign";
import { Digit, DigitValue } from "./digit";
import { Fish } from "./fish/fish";
import { Glyph } from "./glyph";
import { Notebook } from "./notebook";
import { Paw } from "./paw/paw";
import { Printer } from "./printer/printer";
import { Sea } from "./sea";
import { Sky } from "./sky";
import { Table } from "./table";

type LevelArgs = GameObjectArgs & {
	difficulty: 0 | 1 | 2 | 3;
	duration: number;
};

export class Level extends GameObject {
	isFirst = true;
	t = 0;
	duration: number;
	tToSpawn: number;
	difficulty: 0 | 1 | 2 | 3;
	levelFishTypes: FishType[];
	levelVariants: FishChosenVariants[];

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

	constructor({ difficulty, duration, ...rest }: LevelArgs) {
		super(rest);
		this.difficulty = difficulty;
		this.duration = duration;

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
				duration: this.duration,
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

			new MovingBelt({
				id: "belt",
				pos: beltPosition,
				size: beltSize,
			}),

			new BeltShadow({ pos: beltPosition, size: beltSize }),

			new Timer({ pos: Vector(8, 9), seconds: this.duration }),

			new CounterCountainer({
				pos: game.root.size.mulv(TOP_RIGHT).diff(Vector(8, -8)),
				origin: TOP_RIGHT,
				children: [
					new CurrencySign({ fontSize: 28, color: "#9C5FA7" }),
					new Counter({ id: "score" }),
				],
			}),

			new Paw({ id: "paw" }),
		]);
	}
}

class CounterCountainer extends Flexbox {
	constructor(args: GameObjectArgs = {}) {
		super({
			...args,
			mode: "hug",
			align: "end",
			justify: "start",
		});
	}

	render(ctx: OffscreenCanvasRenderingContext2D) {
		ctx.beginPath();
		ctx.roundRect(-4, -4, this.size.x + 8, this.size.y + 8, 8);
		ctx.fillStyle = "#E4B4B4";
		ctx.globalAlpha = 0.8;
		ctx.fill();
	}
}

class Counter extends Flexbox {
	longestLength = 1;

	constructor(args: GameObjectArgs = {}) {
		super({
			...args,
			mode: "hug",
			align: "end",
			justify: "start",
			spaceBetween: -2,
		});
		this.setValue(0);
	}

	setValue(value: number) {
		const stringValue = `${value}`;
		this.longestLength = Math.max(stringValue.length, this.longestLength);
		let opacity = 0;
		for (const [index, digit] of stringValue
			.padStart(this.longestLength, "0")
			.split("")
			.entries()) {
			const digitValue = Number(digit) as DigitValue;
			if (digitValue != 0 || index == stringValue.length - 1) {
				opacity = 1;
			}
			const id = `${index}`;
			let digitObject = this.getChild(id) as Digit | undefined;
			if (!digitObject) {
				digitObject = new Digit({
					id,
					value: digitValue,
					opacity: 0,
					fontSize: 28,
				});
				this.addChild(digitObject);
			}
			digitObject.setValue(digitValue);
			digitObject.opacity = opacity;
		}
	}
}

type TimerArgs = GameObjectArgs & {
	seconds: number;
};

class Timer extends CounterCountainer {
	seconds: number;
	t = 0;

	update(deltaT: number) {
		this.t += deltaT;
		const seconds = this.seconds - Math.floor(this.t / 1000);
		(this.getChild("counter") as Counter).setValue(seconds);
	}

	constructor({ seconds, ...rest }: TimerArgs) {
		super(rest);
		this.seconds = seconds;
		this.addChildren([
			new Counter({ id: "counter" }),
			new Glyph({
				size: Vector(8, 8),
				color: "#9C5FA7",
				fontSize: 14,
				path: "M5 1.8c-1.4-1-3.1-.6-3.4.5-.2.6-.2 1.9 2.1 2.3 2.8.5 2 3.4-.4 3.4-.4 0-1.2-.2-2-1",
			}),
		]);
	}
}
