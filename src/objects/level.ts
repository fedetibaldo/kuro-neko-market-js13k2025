import { diContainer } from "../core/di-container";
import { Flexbox } from "../core/flexbox";
import { Game } from "../core/game";
import { GameObject, GameObjectArgs } from "../core/game-object";
import { TOP_RIGHT, Vector } from "../core/vector";
import { FishType, fishTypes } from "../data/fish-types";
import { DropTargetInterface } from "../systems/interactable/interactable.types";
import {
	LEVEL_SCORE_EVENT,
	LEVEL_SPAWN_EVENT,
	LEVEL_TICK_EVENT,
	LevelSpawnFrequency,
	LevelSystem,
} from "../systems/level/level.system";
import { clamp } from "../utils/clamp";
import { chance } from "../utils/random";
import { BeltColor } from "./belt/belt-color";
import { BeltShadow } from "./belt/belt-shadow";
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
};

export class Level extends GameObject {
	level: LevelSystem;

	onSpawn(index: number): void {
		const flipH = chance(1 / 2);
		const belt = this.getChild("belt")! as DropTargetInterface;
		const fish = new Fish({
			flipH,
			rotation: (-Math.PI / 4) * 3 * (flipH ? -1 : 1),
			fishIndex: index,
		});
		fish.pos = belt
			.toLocal(belt.getDropPoint(Vector(-30, 0)))
			.diff(fish.size.mulv(fish.origin));
		fish.scale = belt.layer / fish.baseLayer;
		fish.vel = belt.vel;
		fish.layer = belt.layer;
		belt.addChild(fish);
	}

	constructor({ difficulty, ...rest }: LevelArgs) {
		super(rest);

		const game = diContainer.get(Game);
		this.level = diContainer.get(LevelSystem);

		const fishes = fishTypes.slice(0, difficulty + 1);
		this.level.init(
			fishes,
			Math.max(difficulty, 2) as LevelSpawnFrequency,
			difficulty
		);
		this.level.start();

		this.level.on(LEVEL_SPAWN_EVENT, (idx: number) => this.onSpawn(idx));
		this.level.on(LEVEL_TICK_EVENT, (time: number) =>
			(this.getChild("timer") as Counter).setValue(Math.floor(time))
		);
		this.level.on(LEVEL_SCORE_EVENT, (score: number) =>
			(this.getChild("score") as Counter).setValue(score)
		);

		const beltSize = Vector(game.root.size.x, 40);
		const beltPosition = Vector(0, 110);

		const tableSize = Vector(game.root.size.x, 90);

		const seaSize = Vector(game.root.size.x, 30);
		const seaPosition = Vector(0, beltPosition.y - seaSize.y);

		this.addChildren([
			new BeltColor({
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

			new CounterCountainer({
				pos: Vector(8, 9),
				children: [
					new Counter({ id: "timer" }),
					new Glyph({
						size: Vector(8, 8),
						color: "#9C5FA7",
						fontSize: 14,
						path: "M5 1.8c-1.4-1-3.1-.6-3.4.5-.2.6-.2 1.9 2.1 2.3 2.8.5 2 3.4-.4 3.4-.4 0-1.2-.2-2-1",
					}),
				],
			}),

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
