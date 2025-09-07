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
import { TOP_LEFT, Vector, ZERO } from "../core/vector";
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
import { range } from "../utils/range";
import { getStored, setStored } from "../utils/storage";
import { Digit, DigitValue } from "./digit";
import { FishGraphic } from "./fish/fish-graphic";
import { DIAMOND_ID } from "./patterns/diamond";
import { WAVE_ID } from "./patterns/wave";

const buttonSize = Vector(36, 24);

const baseLevels: (LevelInfo | null)[] = [
	[[0], 0, 0, 0],
	[[0, 1], 1, 1, 0],
	[[0, 1, 2], 2, 2, 0],
];

type LevelInfo = [...LevelAttributes, number];

export class LevelSelect extends GameObject {
	game = diContainer.get(Game);
	input = diContainer.get(InputServer);
	scrollLerp: IncrementalLerp<Vector> | undefined;
	container: Flexbox | null;
	addButton: ActiveSurface | null;

	constructor() {
		super();
		this.recreateContainer();
	}

	onInputMouseDown = ({ pos }: { pos: Vector }) => {
		if (this.addButton!.isPointWithinObject(pos)) {
			setStored("l", (getStored<number>("l") ?? baseLevels.length) + 1);
			this.recreateContainer();
		}
	};

	onScroll = (delta: Vector) => {
		const clampedPos = Vector(
			32,
			clamp(
				this.container!.pos.add(delta).y,
				-this.container!.size.y + this.game.root.size.y - 24,
				24
			)
		);
		this.scrollLerp = makeFixedTimeIncrementalLerp(
			this.container!.pos,
			clampedPos,
			100
		);
	};

	listeners = [
		this.input.on(INPUT_SCROLL_EVENT, this.onScroll),
		this.input.on(INPUT_MOUSEDOWN_EVENT, this.onInputMouseDown),
	];

	kill() {
		super.kill();
		this.listeners.map((off) => off());
	}

	recreateContainer() {
		const prevPos = this.container?.pos || Vector(32, 24);
		if (this.container) {
			this.container.kill();
			this.addButton = null;
		}

		const levels = [...baseLevels];

		range(Math.max(levels.length, getStored("l"))).map((idx) => {
			const existingInfo = levels[idx];
			const additionalInfo = getStored(idx) as LevelInfo | null;
			if (existingInfo) {
				if (additionalInfo) {
					existingInfo[3] = additionalInfo?.[3];
				}
			} else {
				levels.push(additionalInfo);
			}
		});

		let isAdding = false;

		const containerChildren: GameObject[] = levels.map((level, index) => {
			return new Card({
				levelNumber: index,
				isEditable: (isAdding = !level),
				level: level ?? [[], 0, 0, 0],
			});
		});

		this.addButton = new ActiveSurface({ radius: 12, size: buttonSize });
		if (!isAdding) {
			containerChildren.push(this.addButton);
		}

		this.container = new Flexbox({
			pos: prevPos,
			direction: "col",
			spaceBetween: 12,
			justify: "start",
			mode: "hug",
			children: containerChildren,
		});
		this.addChild(this.container);
	}

	update(deltaT: number): void {
		if (this.scrollLerp) {
			this.container!.pos = this.scrollLerp(deltaT);
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
	levelNumber: number;
	level: LevelInfo;
};

class Card extends GameObject {
	size = Vector(296, 32);
	isEditable: boolean;
	levelNumber: number;

	fishes: FishGraphic[];
	difficultyGraphic: Digit;
	speedGraphic: Digit;
	actionButton: ActiveSurface;
	disabledActionButton: InactiveSurface;
	fishTypeIndices: FishTypeIndex[] = [];

	mouseDownListener: OffFunction;

	kill(): void {
		super.kill();
		this.mouseDownListener();
		this.fishes = [];
		this.difficultyGraphic = null as any;
		this.speedGraphic = null as any;
	}

	getLevelAttributes(): LevelAttributes {
		return [
			this.fishTypeIndices,
			this.speedGraphic.value,
			this.difficultyGraphic.value,
		] as LevelAttributes;
	}

	playLevel() {
		diContainer.get(LevelSystem).init(...this.getLevelAttributes());
		diContainer.get(ScreenSystem).to(LEVEL_SCREEN);
	}

	saveLevel() {
		setStored(this.levelNumber, [...this.getLevelAttributes(), 0]);
		(this as any).parent.parent.recreateContainer();
	}

	toggleFishTypeIndex(idx: FishTypeIndex) {
		const isNextEnabled = !this.fishTypeIndices.includes(idx);
		if (isNextEnabled) {
			this.fishTypeIndices.push(idx);
		} else {
			this.fishTypeIndices = this.fishTypeIndices.filter(
				(activeIdx) => activeIdx != idx
			);
		}
		const fish = this.fishes[idx]!;
		fish.overrideColor = isNextEnabled ? null : "#3A1141";
		fish.isShadowHidden = !isNextEnabled;
		const isValid = this.fishTypeIndices.length != 0;
		this.actionButton.opacity = isValid ? 1 : 0;
		this.disabledActionButton.opacity = isValid ? 0 : 1;
	}

	cycleSpeed() {
		this.speedGraphic.setValue(
			((this.speedGraphic.value + 1) % 3) as DigitValue
		);
	}

	cycleDifficulty() {
		this.difficultyGraphic.setValue(
			((this.difficultyGraphic.value + 1) % 4) as DigitValue
		);
	}

	constructor({ isEditable = false, levelNumber, level, ...rest }: CardArgs) {
		super(rest);
		this.levelNumber = levelNumber;
		this.isEditable = isEditable;

		const DynamicSurface = isEditable ? ActiveSurface : InactiveSurface;

		this.fishes = fishTypes.map((type, idx) => {
			return new FishGraphic({
				size: Vector(type.size.x, 80),
				overrideColor: "#3A1141",
				isShadowHidden: true,
				origin: TOP_LEFT,
				type,
			});
		});

		this.difficultyGraphic = new Digit({ value: level[2] });
		const difficultyButton = new DynamicSurface({
			radius: 4,
			size: buttonSize,
			children: [
				new Flexbox({ size: buttonSize, children: [this.difficultyGraphic] }),
			],
		});

		this.speedGraphic = new Digit({ value: level[1] });
		const speedButton = new DynamicSurface({
			radius: 4,
			size: buttonSize,
			children: [
				new Flexbox({ size: buttonSize, children: [this.speedGraphic] }),
			],
		});

		this.actionButton = new ActiveSurface({
			radius: 12,
			size: buttonSize,
			children: [],
			opacity: isEditable ? 0 : 1,
		});
		this.disabledActionButton = new InactiveSurface({
			radius: 12,
			size: buttonSize,
			children: [],
			opacity: isEditable ? 1 : 0,
		});

		for (const enabledIdx of level[0]) {
			this.toggleFishTypeIndex(enabledIdx);
		}

		this.mouseDownListener = diContainer
			.get(InputServer)
			.on(INPUT_MOUSEDOWN_EVENT, ({ pos }) => {
				if (
					this.actionButton.opacity == 1 &&
					this.actionButton.isPointWithinObject(pos)
				) {
					isEditable ? this.saveLevel() : this.playLevel();
				}
				if (isEditable) {
					this.fishes.map((fish, idx) => {
						if (fish.isPointWithinObject(pos)) {
							this.toggleFishTypeIndex(idx as FishTypeIndex);
						}
					});
					if (difficultyButton.isPointWithinObject(pos)) {
						this.cycleDifficulty();
					}
					if (speedButton.isPointWithinObject(pos)) {
						this.cycleSpeed();
					}
				}
			});

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
						new DynamicSurface({
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
						speedButton,
						difficultyButton,
						new GameObject({
							size: buttonSize,
							children: [this.actionButton, this.disabledActionButton],
						}),
					],
				}),
			],
		});

		this.addChildren([container]);
	}
}
