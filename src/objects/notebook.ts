import { diContainer } from "../core/di-container";
import { drawSvg } from "../core/draw-svg";
import { Flexbox } from "../core/flexbox";
import { GameObject, GameObjectArgs } from "../core/game-object";
import {
	easeIn,
	easeOut,
	IncrementalLerp,
	makeFixedTimeIncrementalLerp,
} from "../core/lerp";
import { BOTTOM, BOTTOM_LEFT, CENTER, Vector, ZERO } from "../core/vector";
import { PressableInterface } from "../systems/interactable/interactable.types";
import { LevelSystem } from "../systems/level/level.system";
import { fillCircle, fillRoundRect } from "../utils/draw";
import { gradient } from "../utils/gradient";
import { range } from "../utils/range";
import { CurrencySign } from "./currency-sign";
import { Digit, DigitValue } from "./digit";
import { MathSign } from "./math-sign";
import { Svg } from "./svg";

type NotebookArgs = GameObjectArgs;
const size = Vector(80, 63);

export class Notebook extends GameObject implements PressableInterface {
	level: LevelSystem;
	page: number;
	size = size;
	origin = CENTER;

	baseLayer = 0.8;
	readonly canBePressed = true;

	scaleLerp: IncrementalLerp<number> | undefined;

	getPressPoint(point: Vector): Vector {
		return this.toGlobal(this.size.mul(1 / 2));
	}

	async press() {
		const duration = 200;
		const lerp = makeFixedTimeIncrementalLerp(1, 0.75, duration / 2, easeIn);
		this.scaleLerp = lerp;
		await new Promise((resolve) => setTimeout(resolve, duration / 2));
		this.onPageChange((this.page + 1) % this.level.fishTypes.length);
		if (this.scaleLerp !== lerp) return;
		this.scaleLerp = makeFixedTimeIncrementalLerp(
			0.75,
			1,
			duration / 2,
			easeOut
		);
	}

	update(deltaT: number) {
		if (this.scaleLerp) {
			this.scale = this.scaleLerp(deltaT);
		}
	}

	constructor(args: NotebookArgs) {
		super(args);
		this.level = diContainer.get(LevelSystem);
		this.onPageChange(0);
	}

	onPageChange(page: number) {
		this.page = page;
		const oldPage = this.getChild("page");
		if (oldPage) {
			oldPage.kill();
		}

		const fishType = this.level.fishTypes[this.page]!;
		const scoringVariants = this.level.scoringVariants[this.page]!;

		this.addChild(
			new GameObject({
				id: "page",
				rotation: -Math.PI / 32,
				children: [
					new Page({ size }),
					new Circle({
						size: Vector(24, 24),
						pos: Vector(4, 7),
						color: "#F3DEF7",
						children: [
							new Flexbox({
								size: Vector(24, 24),
								children: [
									new CurrencySign({ svgStrokeColor: "#9C5FA7" }),
									new Digit({ value: fishType.basePrice }),
								],
							}),
						],
					}),
					new Flexbox({
						spaceBetween: 13,
						pos: Vector(0, -3),
						size: Vector(80, 6),
						children: range(5).map(() => new Ring({ size: Vector(2, 6) })),
					}),
					// new Svg({
					// 	pos: Vector(33, 7),
					// 	lineWidth: 1,
					// 	color: "#3A1141",
					// 	path: "M29 19v-2s-1 3-2 2l-1-2v3l-2-2M35 17v-1m0 0-1-1m1 1s-2 2-5 2M17 13v-3s1 3 2 2v-2l1 2 2-2M11 13l-1-2m0 0h2m-2 0s2 2 5 1M26 2v2s1-3 2-2l1 3 1-3 1 1",
					// 	opacity: 0.3,
					// }),
					new Svg({
						pos: Vector(33, 7),
						svgLineWidth: 8,
						svgStrokeColor: fishType.bodyFill2,
						path: "M5 20 6 4l11 16 3-16 11 14",
						opacity: 0.3,
					}),
					new Svg({
						pos: Vector(33, 7),
						svgLineWidth: 8,
						svgStrokeColor: fishType.tailFill1,
						path: "M40 17 35 6",
						opacity: 0.3,
					}),
					new Flexbox({
						pos: Vector(33, 9 + 20),
						align: "start",
						rotation: -Math.PI / 2,
						scale: 0.5,
						size: Vector(40, 20),
						children: [
							new FishSilhouette({
								body: fishType.body,
								tail: fishType.tail,
								eyes: fishType.eyes,
								size: fishType.size,
							}),
						],
					}),
					new Flexbox({
						pos: Vector(0, 33),
						size: Vector(80, 24),
						spaceBetween: 5,
						children: scoringVariants.map(([option, modifier]) => {
							const makeColoredCircles = (color: string) => {
								return new GameObject({
									children: [
										new Circle({
											pos: Vector(10, 0),
											opacity: 0.5,
											size: Vector(4, 4),
											color,
										}),
										new Circle({
											pos: Vector(1, 1),
											opacity: 0.4,
											size: Vector(6, 6),
											color,
										}),
										new Circle({
											pos: Vector(4, 4),
											opacity: 0.4,
											size: Vector(10, 10),
											color,
										}),
									],
								});
							};

							const graphic = option
								? option.eyeColor
									? new GameObject({
											size: Vector(18, 16),
											children: [
												new Circle({
													pos: Vector(9.5, 4.5),
													size: Vector(6, 6),
													color: "#C7B3CA",
												}),
												new Svg({
													path: "M18 1c-6 0-13.5 4.2-17 11.6L6 15M12.5 3c-6 0-6 9 0 9s6-9 0-9Z",
												}),
											],
									  })
									: option.tailFill1 || option.tailFill2
									? new GameObject({
											size: Vector(18, 16),
											children: [
												new Svg({
													path: fishType.tailPath,
												}),
												makeColoredCircles(
													(option.tailFill1 || option.tailFill2) as string
												),
											],
									  })
									: option.pattern
									? new Svg({
											size: Vector(16, 16),
											origin: CENTER,
											rotation: Math.PI,
											path: option.pattern,
									  })
									: option.bodyFill1 || option.bodyFill2
									? new GameObject({
											size: Vector(18, 16),
											children: [
												// new Svg({
												// 	pos: Vector(1, 0),
												// 	path: fishType.pattern,
												// }),
												makeColoredCircles(
													(option.bodyFill1 || option.bodyFill2) as string
												),
											],
									  })
									: null
								: null;

							return new Flexbox({
								size: Vector(18, 24),
								spaceBetween: 0,
								direction: "col",
								justify: "start",
								children: [
									...(graphic ? [graphic] : []),
									new Flexbox({
										size: Vector(24, 0),
										align: "start",
										children: [
											new MathSign({
												origin: BOTTOM,
												glyphFontSize: 10,
												value: modifier,
											}),
											new Digit({
												origin: BOTTOM,
												glyphFontSize: 10,
												value: Math.abs(modifier) as DigitValue,
											}),
										],
									}),
								],
							});
						}),
					}),
				],
			})
		);
	}
}

class Page extends GameObject {
	render(ctx: OffscreenCanvasRenderingContext2D): void {
		fillRoundRect(ctx, ZERO, this.size.add(Vector(0, 3)), 1, "#00000088");
		fillRoundRect(
			ctx,
			ZERO,
			this.size,
			1,
			gradient(ctx, ZERO, this.size.mulv(BOTTOM_LEFT), [
				[0, "#F9F4F0"],
				[1, "#F3EAE2"],
			])
		);
	}
}

type FishSilhouetteArgs = GameObjectArgs & {
	body: string;
	tail: string;
	eyes: [number, Vector][];
};

class FishSilhouette extends GameObject {
	body: string;
	tail: string;
	eyes: [number, Vector][];

	constructor({ body, tail, eyes, ...rest }: FishSilhouetteArgs) {
		super(rest);
		this.body = body;
		this.tail = tail;
		this.eyes = eyes;
	}

	render(ctx: OffscreenCanvasRenderingContext2D): void {
		ctx.lineWidth = 2;
		ctx.strokeStyle = "#3A1141";
		drawSvg(ctx, { path: this.body });
		ctx.stroke();
		drawSvg(ctx, { path: this.tail });
		ctx.stroke();
		for (const [diameter, pos] of this.eyes) {
			const radius = (diameter + 2) / 2;
			ctx.beginPath();
			ctx.arc(pos.x + radius, pos.y + radius, radius, 0, Math.PI * 2, true);
			ctx.stroke();
		}
	}
}

class Ring extends GameObject {
	render(ctx: OffscreenCanvasRenderingContext2D): void {
		fillRoundRect(ctx, Vector(0, 2), this.size, 1, "#00000088");
		fillRoundRect(
			ctx,
			ZERO,
			this.size,
			1,
			gradient(ctx, ZERO, this.size.mulv(BOTTOM_LEFT), [
				[0, "white"],
				[0.4, "#BEADB8"],
			])
		);
	}
}

class Circle extends GameObject {
	render(ctx: OffscreenCanvasRenderingContext2D): void {
		fillCircle(ctx, ZERO, this.size.x / 2, this.color as string);
	}
}
