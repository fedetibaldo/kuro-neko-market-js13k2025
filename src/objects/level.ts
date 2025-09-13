import { diContainer } from "../core/di-container";
import { Flexbox } from "../core/flexbox";
import { Game } from "../core/game";
import { GameObject, GameObjectArgs } from "../core/game-object";
import { OffFunction } from "../core/observable";
import { unique } from "../core/unique";
import { TOP_RIGHT, Vector } from "../core/vector";
import { RESULTS_SCREEN } from "../data/screens";
import { SEAGULL_SOUND, WAVE_SOUND } from "../data/sounds";
import { DropTargetInterface } from "../systems/interactable/interactable.types";
import {
	LEVEL_END_EVENT,
	LEVEL_SCORE_EVENT,
	LEVEL_SPAWN_EVENT,
	LEVEL_TICK_EVENT,
	LevelSystem,
} from "../systems/level/level.system";
import { ScreenSystem } from "../systems/screen/screen.system";
import { clamp } from "../utils/clamp";
import { fillRoundRect } from "../utils/draw";
import { chance, randomInt } from "../utils/random";
import { buildSamples, playSamples, zzfx } from "../vendor/zzfx";
import { BeltColor } from "./belt/belt-color";
import { BeltShadow } from "./belt/belt-shadow";
import { BELT_ID, MovingBelt } from "./belt/moving-belt";
import { Counter } from "./counter";
import { CurrencySign } from "./currency-sign";
import { Fish } from "./fish/fish";
import { Glyph } from "./glyph";
import { Notebook } from "./notebook";
import { Paw } from "./paw/paw";
import { Printer } from "./printer/printer";
import { Sea } from "./sea";
import { Sky } from "./sky";
import { Table } from "./table";

const SCORE_ID = unique();
const TIMER_ID = unique();

const waveSamples = buildSamples(...WAVE_SOUND);

export class Level extends GameObject {
	level: LevelSystem;

	onSpawn(index: number): void {
		const flipH = chance(1 / 2);
		const belt = this.getChild(BELT_ID)! as DropTargetInterface;
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

	toDestroy: OffFunction[];
	seagullTimeout: number;
	waveTimeout: number;

	kill() {
		super.kill();
		this.toDestroy.map((off) => off());
		clearTimeout(this.seagullTimeout);
		clearTimeout(this.waveTimeout);
	}

	playSeagull = () => {
		this.seagullTimeout = (setTimeout as Window["setTimeout"])(
			this.playSeagull,
			randomInt(500, 3000) * (chance(1 / 5) ? 10 : 1)
		);
		zzfx(...SEAGULL_SOUND);
	};

	playWave = () => {
		this.waveTimeout = (setTimeout as Window["setTimeout"])(
			this.playWave,
			randomInt(4000, 5000)
		);
		playSamples([waveSamples]);
	};

	constructor() {
		super();

		const game = diContainer.get(Game);
		this.level = diContainer.get(LevelSystem);
		this.level.start();
		this.playWave();
		this.playSeagull();

		this.toDestroy = [
			this.level.on(LEVEL_END_EVENT, () =>
				diContainer.get(ScreenSystem).to(RESULTS_SCREEN)
			),
			this.level.on(LEVEL_SPAWN_EVENT, (idx: number) => this.onSpawn(idx)),
			this.level.on(LEVEL_TICK_EVENT, (time: number) =>
				(this.getChild(TIMER_ID) as Counter).setValue(Math.floor(time))
			),
			this.level.on(LEVEL_SCORE_EVENT, (score: number) =>
				(this.getChild(SCORE_ID) as Counter).setValue(score)
			),
		];

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
				pos: Vector(0, game.root.size.y - 90),
				size: tableSize,
				heirs: [
					new Notebook({
						pos: Vector(5, 23),
					}),
					new Printer({
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
				pos: beltPosition,
				size: beltSize,
			}),

			new BeltShadow({ pos: beltPosition, size: beltSize }),

			new CounterCountainer({
				pos: Vector(8, 9),
				heirs: [
					new Counter({ id: TIMER_ID, glyphFontSize: 28 }),
					new Glyph({
						size: Vector(8, 8),
						svgStrokeColor: "#9C5FA7",
						glyphFontSize: 14,
						path: "M5 1.8c-1.4-1-3.1-.6-3.4.5-.2.6-.2 1.9 2.1 2.3 2.8.5 2 3.4-.4 3.4-.4 0-1.2-.2-2-1",
					}),
				],
			}),

			new CounterCountainer({
				pos: game.root.size.mulv(TOP_RIGHT).diff(Vector(8, -8)),
				origin: TOP_RIGHT,
				heirs: [
					new CurrencySign({ glyphFontSize: 28, svgStrokeColor: "#9C5FA7" }),
					new Counter({ id: SCORE_ID, glyphFontSize: 28 }),
				],
			}),

			new Paw(),
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
		fillRoundRect(
			ctx,
			Vector(-4, -4),
			this.size.add(Vector(8, 8)),
			8,
			"#E4B4B4"
		);
	}
}
