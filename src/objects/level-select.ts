import { diContainer } from "../core/di-container";
import { Flexbox } from "../core/flexbox";
import { Game } from "../core/game";
import { GameObject, GameObjectArgs } from "../core/game-object";
import {
	INPUT_MOUSEDOWN_EVENT,
	INPUT_SCROLL_EVENT,
	InputServer,
} from "../core/input.server";
import {
	easeLinear,
	IncrementalLerp,
	makeFixedTimeIncrementalLerp,
} from "../core/lerp";
import { OffFunction } from "../core/observable";
import { Vector, ZERO } from "../core/vector";
import { fishTypes } from "../data/fish-types";
import { LEVEL_SCREEN } from "../data/screens";
import {
	FishTypeIndex,
	LevelAttributes,
	LevelSystem,
} from "../systems/level/level.system";
import { ScreenSystem } from "../systems/screen/screen.system";
import { clamp } from "../utils/clamp";
import { fillRect, fillRoundRect, stroke } from "../utils/draw";
import { makePattern } from "../utils/pattern";
import { Digit } from "./digit";
import { FishGraphic } from "./fish/fish-graphic";
import { DIAMOND_ID } from "./patterns/diamond";
import { WAVE_ID } from "./patterns/wave";

export class LevelSelect extends GameObject {
	game = diContainer.get(Game);
	input = diContainer.get(InputServer);
	scrollLerp: IncrementalLerp<Vector> | undefined;
	container: Flexbox;

	constructor() {
		super();

		const levels: LevelAttributes[] = [
			[[0], 0, 0],
			[[0, 1], 1, 1],
			[[0, 1, 2], 2, 2],
		];

		this.container = new Flexbox({
			pos: Vector(32, 24),
			direction: "col",
			spaceBetween: 12,
			justify: "start",
			mode: "hug",
			children: [
				...levels.map((level) => {
					return new Card({ level });
				}),
				// new Card({ isEditable: true, level: [[], 0, 0] }),
			],
		});
		this.addChild(this.container);
		this.input.on(INPUT_SCROLL_EVENT, this.onScroll);
	}

	onScroll = (delta: Vector) => {
		const clampedPos = Vector(
			32,
			clamp(
				this.container.pos.add(delta).y,
				-this.container.size.y + this.game.root.size.y - 24,
				24
			)
		);
		this.scrollLerp = makeFixedTimeIncrementalLerp(
			this.container.pos,
			clampedPos,
			100,
			easeLinear
		);
	};

	update(deltaT: number): void {
		if (this.scrollLerp) {
			this.container.pos = this.scrollLerp(deltaT);
		}
	}

	render(ctx: OffscreenCanvasRenderingContext2D) {
		const game = diContainer.get(Game);
		fillRect(ctx, ZERO, game.root.size, makePattern(ctx, WAVE_ID));
	}
}

class Bg extends GameObject {
	render(ctx: OffscreenCanvasRenderingContext2D): void {
		fillRoundRect(ctx, ZERO, this.size, 16, makePattern(ctx, DIAMOND_ID));
	}
}

type InactiveSurfaceArgs = GameObjectArgs & {
	radius: number;
};

class InactiveSurface extends GameObject {
	radius: number;

	constructor({ radius, ...rest }: InactiveSurfaceArgs) {
		super(rest);
		this.radius = radius;
	}
	render(ctx: OffscreenCanvasRenderingContext2D): void {
		fillRoundRect(ctx, ZERO, this.size, this.radius, "#560A0A55");
	}
}

class ActiveSurface extends InactiveSurface {
	render(ctx: OffscreenCanvasRenderingContext2D): void {
		fillRoundRect(ctx, Vector(0, 2), this.size, this.radius, "#000000dd");
		fillRoundRect(ctx, ZERO, this.size, this.radius, "#FF9838DD");
		stroke(ctx, "white");
	}
}

type CardArgs = GameObjectArgs & {
	isEditable?: boolean;
	level: LevelAttributes;
};

class Card extends GameObject {
	input = diContainer.get(InputServer);
	size = Vector(296, 32);
	isEditable: boolean;

	fishes: FishGraphic[];
	difficultyGraphic: Digit;
	speedGraphic: Digit;
	fishTypeIndices: FishTypeIndex[];

	listeners: OffFunction[] = [];

	kill(): void {
		super.kill();
		console.log("here");
		this.listeners.forEach((off) => off());
	}

	toggleFishTypeIndex(idx: FishTypeIndex) {
		if (this.fishTypeIndices.includes(idx)) {
			this.fishTypeIndices = this.fishTypeIndices.filter(
				(activeIdx) => activeIdx != idx
			);
		} else {
			this.fishTypeIndices.push(idx);
		}
	}

	constructor({ isEditable = false, level, ...rest }: CardArgs) {
		super(rest);
		this.isEditable = isEditable;

		const DynamicSurface = isEditable ? ActiveSurface : InactiveSurface;

		const buttonSize = Vector(36, 24);

		this.fishTypeIndices = level[0];

		this.fishes = fishTypes.map((type, idx) => {
			const isEnabled = level[0].includes(idx as FishTypeIndex);
			return new FishGraphic({
				size: Vector(type.size.x, 80),
				overrideColor: isEnabled ? undefined : "#3A1141",
				isShadowHidden: !isEnabled,
				type,
			});
		});
		if (isEditable) {
			this.fishes.map((fish, idx) => {
				this.input.on(INPUT_MOUSEDOWN_EVENT, ({ pos }) => {
					if (fish.isPointWithinObject(pos)) {
						this.toggleFishTypeIndex(idx as FishTypeIndex);
					}
				});
			});
		}

		this.difficultyGraphic = new Digit({ value: level[2] });
		const difficultyButton = new DynamicSurface({
			radius: 4,
			size: buttonSize,
			children: [
				new Flexbox({ size: buttonSize, children: [this.difficultyGraphic] }),
			],
		});
		if (isEditable) {
			this.input.on(INPUT_MOUSEDOWN_EVENT, ({ pos }) => {
				if (difficultyButton.isPointWithinObject(pos)) {
					// this.cycleDifficulty();
				}
			});
		}

		this.speedGraphic = new Digit({ value: level[1] });
		const speedButton = new DynamicSurface({
			radius: 4,
			size: buttonSize,
			children: [
				new Flexbox({ size: buttonSize, children: [this.speedGraphic] }),
			],
		});
		if (isEditable) {
			this.input.on(INPUT_MOUSEDOWN_EVENT, ({ pos }) => {
				if (speedButton.isPointWithinObject(pos)) {
					// this.cycleSpeed();
				}
			});
		}

		const actionButton = new ActiveSurface({
			radius: 12,
			size: buttonSize,
			children: [],
		});
		this.listeners.push(
			this.input.on(INPUT_MOUSEDOWN_EVENT, ({ pos }) => {
				if (actionButton.isPointWithinObject(pos)) {
					diContainer.get(LevelSystem).init(...level);
					diContainer.get(ScreenSystem).to(LEVEL_SCREEN);
				}
			})
		);

		const container = new Bg({
			size: this.size,
			children: [
				new Flexbox({
					size: this.size.diff(Vector(12, 8)),
					pos: Vector(6, 4),
					spaceBetween: 8,
					children: [
						new InactiveSurface({
							pos: Vector(6, 4),
							radius: 12,
							size: Vector(40, 24),
						}),
						new InactiveSurface({
							radius: 4,
							size: Vector(106, 24),
							children: [
								new Flexbox({
									pos: Vector(4, 12),
									direction: "col",
									// size: Vector(60, 0),
									align: "center",
									justify: "start",
									rotation: -Math.PI / 2,
									spaceBetween: (4 * 1) / 0.375,
									scale: 0.375,
									children: this.fishes,
								}),
							],
						}),
						difficultyButton,
						speedButton,
						actionButton,
					],
				}),
			],
		});

		this.addChildren([container]);
	}
}
