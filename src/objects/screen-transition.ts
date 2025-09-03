import { diContainer } from "../core/di-container";
import { Game } from "../core/game";
import { GameObject, GameObjectArgs } from "../core/game-object";
import {
	easeIn,
	easeOut,
	IncrementalLerp,
	makeFixedTimeIncrementalLerp,
} from "../core/lerp";
import { unique } from "../core/unique";
import { CENTER, Vector } from "../core/vector";
import { range } from "../utils/range";

type TransitionSquareArgs = GameObjectArgs & {
	color: string | CanvasGradient | CanvasPattern;
	inDelay: number;
	outDelay?: number;
	duration: number;
};

class TransitionSquare extends GameObject {
	color: string | CanvasGradient | CanvasPattern;
	rotationLerp: IncrementalLerp<number> | undefined;
	scaleLerp: IncrementalLerp<number> | undefined;

	origin = CENTER;

	constructor({
		color,
		inDelay,
		outDelay,
		duration,
		...rest
	}: TransitionSquareArgs) {
		super(rest);
		this.color = color;
		this.scale = 0;
		new Promise((resolve) => setTimeout(resolve, inDelay)).then(() => {
			this.rotationLerp = makeFixedTimeIncrementalLerp(
				0,
				Math.PI,
				duration,
				easeOut
			);
			this.scaleLerp = makeFixedTimeIncrementalLerp(0, 1, duration, easeOut);
		});
		if (outDelay) {
			new Promise((resolve) => setTimeout(resolve, outDelay)).then(() => {
				this.rotationLerp = makeFixedTimeIncrementalLerp(
					Math.PI,
					Math.PI * 2,
					duration,
					easeIn
				);
				this.scaleLerp = makeFixedTimeIncrementalLerp(1, 0, duration, easeIn);
			});
		}
	}

	update(deltaT: number): void {
		if (this.rotationLerp) {
			this.rotation = this.rotationLerp(deltaT);
		}
		if (this.scaleLerp) {
			this.scale = this.scaleLerp(deltaT);
		}
	}

	render(ctx: OffscreenCanvasRenderingContext2D) {
		ctx.fillStyle = this.color;
		ctx.fillRect(0, 0, this.size.x, this.size.y);
	}
}

export const SCREEN_TRANSITION_COMPLETE_EVENT = unique();

export class ScreenTransition extends GameObject {
	constructor() {
		super();
		const game = diContainer.get(Game);
		const squareSize = 20;
		const size = game.root.size.mul(1 / squareSize).ceil();
		const delay = 30;
		const duration = 400;
		const pause = 100;
		const completesAt = duration + (size.x + size.y) * delay;
		for (const row of range(size.y)) {
			for (const col of range(size.x)) {
				const inDelay = (col + row) * delay;
				this.addChild(
					new TransitionSquare({
						color: "#B27242",
						inDelay: inDelay,
						outDelay: completesAt + pause + inDelay,
						duration,
						size: Vector(squareSize, squareSize),
						pos: Vector(col, row).mul(squareSize),
					})
				);
			}
		}
		new Promise((resolve) => setTimeout(resolve, completesAt)).then(() =>
			this.trigger(SCREEN_TRANSITION_COMPLETE_EVENT)
		);
	}
}
