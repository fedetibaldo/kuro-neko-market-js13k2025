import { diContainer } from "../../core/di-container";
import { Flexbox } from "../../core/flexbox";
import { Game } from "../../core/game";
import { GameObject } from "../../core/game-object";
import {
	easeInOut,
	IncrementalLerp,
	makeFixedTimeIncrementalLerp,
} from "../../core/lerp";
import { BOTTOM, CENTER, ONE, TOP, Vector, ZERO } from "../../core/vector";
import { GLYPH_PERCENT, GLYPH_SLASH, GLYPH_TICK } from "../../data/glyphs";
import { LEVEL_SELECT_SCREEN } from "../../data/screens";
import { LevelSystem } from "../../systems/level/level.system";
import { ParticleSystem } from "../../systems/particle/particle.system";
import { ScreenSystem } from "../../systems/screen/screen.system";
import { clamp } from "../../utils/clamp";
import { fillRect } from "../../utils/draw";
import { makePattern } from "../../utils/pattern";
import { randomFloat } from "../../utils/random";
import { range } from "../../utils/range";
import { Counter } from "../counter";
import { CurrencySign } from "../currency-sign";
import { FishGraphic } from "../fish/fish-graphic";
import { Glyph } from "../glyph";
import { Ray } from "../particles/ray";
import { DIAMOND_ID } from "../patterns/diamond";
import { ActiveSurface, SURFACE_CLICK } from "../surface";
import { Svg } from "../svg";

export class Results extends GameObject {
	game: Game;
	level: LevelSystem;

	moneyLine: Flexbox;
	percentLine: Flexbox;
	fishes: GameObject[];
	scoreCounter: Counter;

	revealLerp: IncrementalLerp<number>;
	percentLerp: IncrementalLerp<number> | undefined;

	kill() {
		super.kill();
		this.moneyLine = null as any;
		this.percentLine = null as any;
		this.fishes = [];
		this.scoreCounter = null as any;
	}

	constructor() {
		super();
		this.level = diContainer.get(LevelSystem);
		this.game = diContainer.get(Game);

		const spawnedFish = this.level.spawnedFishes;
		const fishPerRow = 8;
		const rows = Math.ceil(spawnedFish.length / fishPerRow);
		const monoSpacedSize = Vector(50, 80);
		const rowHeight = monoSpacedSize.y;

		this.scoreCounter = new Counter({
			glyphFontSize: 32,
			svgStrokeColor: "#301802",
		});

		this.moneyLine = new Flexbox({
			size: Vector(this.game.root.size.x, 32),
			origin: TOP,
			children: [
				new CurrencySign({
					glyphFontSize: 32,
					svgStrokeColor: "#AA590F",
				}),
				this.scoreCounter,
				new Glyph({
					glyphFontSize: 32,
					path: GLYPH_SLASH,
					size: Vector(9, 9),
					svgStrokeColor: "#AA590F",
				}),
				new Counter({
					glyphFontSize: 32,
					value: this.level.getMaximumScore(),
					svgStrokeColor: "#301802",
				}),
				new CurrencySign({
					glyphFontSize: 32,
					svgStrokeColor: "#AA590F",
				}),
			],
		});

		this.percentLine = new Flexbox({
			size: Vector(this.game.root.size.x, 32),
			origin: BOTTOM,
			spaceBetween: 4,
			scale: 0,
			children: [
				new Counter({
					glyphFontSize: 32,
					value: Math.floor(
						(this.level.getScore() / this.level.getMaximumScore()) * 100
					),
					svgStrokeColor: "#301802",
				}),
				new Glyph({
					glyphFontSize: 32,
					path: GLYPH_PERCENT,
					size: Vector(9, 9),
					svgStrokeColor: "#AA590F",
				}),
			],
		});

		this.fishes = spawnedFish.map(
			([type, , isCorrect]) =>
				new GameObject({
					size: monoSpacedSize,
					origin: CENTER,
					children: [
						new FishGraphic({
							type,
							size: monoSpacedSize,
							rotation: -(Math.PI / 4) * 3,
						}),
						...(isCorrect
							? [
									new Flexbox({
										size: monoSpacedSize,
										children: [
											new Glyph({
												svgStrokeColor: "#FEE2E2",
												size: Vector(8, 9),
												path: GLYPH_TICK,
												glyphFontSize: 64,
											}),
										],
									}),
							  ]
							: []),
					],
				})
		);

		this.revealLerp = makeFixedTimeIncrementalLerp(
			0,
			1,
			this.fishes.length * 300,
			easeInOut
		);

		this.addChildren([
			new Flexbox({
				size: this.game.root.size,
				direction: "col",
				children: [
					new GameObject({
						size: Vector(this.game.root.size.x, 32),
						children: [this.moneyLine, this.percentLine],
					}),
					new Flexbox({
						size: Vector(this.game.root.size.x, rowHeight * rows),
						direction: "col",
						scale: 0.5,
						children: [
							...range(rows).map((row) => {
								return new Flexbox({
									size: Vector(this.game.root.size.x, rowHeight),
									spaceBetween: 5,
									children: this.fishes.slice(
										fishPerRow * row,
										fishPerRow * (row + 1)
									),
								});
							}),
						],
					}),
				],
			}),
		]);

		const backButtonSize = Vector(40, 40);
		const backButton = new ActiveSurface({
			pos: Vector(160, 188),
			radius: 20,
			size: backButtonSize,
			children: [
				new Flexbox({
					size: backButtonSize,
					children: [
						new Svg({
							size: Vector(20, 16),
							path: "M7 2h11M7 8h11M7 14h11M3 8H1.5M3 14H1.5M3 2H1.5",
							svgLineWidth: 3,
						}),
					],
				}),
			],
		});
		backButton.on(SURFACE_CLICK, () =>
			diContainer.get(ScreenSystem).to(LEVEL_SELECT_SCREEN)
		);
		this.addChild(backButton);
	}

	waitT = 0;
	scoreLerps: IncrementalLerp<number>[] = [];

	update(deltaT: number): void {
		const progress = this.revealLerp(deltaT);
		let correctFishes = 0;
		this.fishes.map((fish, idx, arr) => {
			fish.scale = clamp(progress * arr.length - idx, 0, 1);
			const [, value, isCorrect] = this.level.spawnedFishes[idx]!;
			if (isCorrect && progress * arr.length - idx > 0) {
				correctFishes += 1;
				if (this.scoreLerps.length < correctFishes) {
					const particles = diContainer.get(ParticleSystem);
					particles.spawnRadial(
						fish.toGlobal(ZERO).diff(Vector(12, 16)),
						WhiteRay
					);
					particles.spawnRadial(
						this.scoreCounter
							.toGlobal(this.scoreCounter.size.mul(1 / 2))
							.add(Vector(randomFloat(-12, 12), randomFloat(-12, 12))),
						WhiteRay
					);
					this.scoreLerps.push(
						makeFixedTimeIncrementalLerp(0, value, 300, easeInOut)
					);
				}
			}
		});
		const score = this.scoreLerps.reduce(
			(sum, lerp) => sum + Math.floor(lerp(deltaT)),
			0
		);
		this.scoreCounter.setValue(score);
		if (this.percentLerp) {
			const percentProg = this.percentLerp(deltaT);
			this.moneyLine.opacity = 1 - percentProg * 0.5;
			this.moneyLine.scale = (1 - percentProg) * (1 - 0.3125) + 0.3125;
			this.moneyLine.pos = Vector(
				this.moneyLine.pos.x,
				-(0.3125 * 32) + (1 - percentProg) * (0.3125 * 32)
			);
			this.percentLine.scale = percentProg;
		}
		if (progress == 1 && !this.percentLerp) {
			this.waitT += deltaT / 1000;
			if (this.waitT > 0.2) {
				this.percentLerp = makeFixedTimeIncrementalLerp(0, 1, 500, easeInOut);
			}
		}
	}

	render(ctx: OffscreenCanvasRenderingContext2D) {
		fillRect(ctx, ZERO, this.game.root.size, makePattern(ctx, DIAMOND_ID));
	}
}

class WhiteRay extends Ray {
	_color = "#FEE2E2";
}
