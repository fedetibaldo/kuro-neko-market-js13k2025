import { diContainer } from "../../core/di-container";
import { Game } from "../../core/game";
import { GameObject, GameObjectArgs } from "../../core/game-object";
import { unique } from "../../core/unique";
import { CENTER, ONE, Vector } from "../../core/vector";
import { range } from "../../utils/range";
import { ScreenSystem } from "./screen.system";

type TransitionSquareArgs = GameObjectArgs & {
	color: string | CanvasGradient | CanvasPattern;
	delay: number;
};

class TransitionSquare extends GameObject {
	screen: ScreenSystem;
	delay: number;
	color: string | CanvasGradient | CanvasPattern;

	origin = CENTER;

	constructor({ color, delay, ...rest }: TransitionSquareArgs) {
		super(rest);
		this.screen = diContainer.get(ScreenSystem);
		this.color = color;
		this.delay = delay;
	}

	update(): void {
		const progression = Math.min(
			Math.max(Math.abs(this.screen.prog - 1 + 0.25 - this.delay) - 0.25, 0) /
				0.5,
			1
		);
		this.rotation = progression * Math.sign(this.screen.prog - 1) * Math.PI;
		this.scale = progression * -1 + 1;
	}

	render(ctx: OffscreenCanvasRenderingContext2D) {
		ctx.fillStyle = this.color;
		ctx.fillRect(0, 0, this.size.x, this.size.y);
	}
}

export const SCREEN_TRANSITION_MIDDLE_EVENT = unique();
export const SCREEN_TRANSITION_COMPLETE_EVENT = unique();

export class ScreenTransition extends GameObject {
	constructor() {
		super();
		const game = diContainer.get(Game);
		const squareSize = 20;
		const size = game.root.size.mul(1 / squareSize).ceil();
		range(size.y).map((row) =>
			range(size.x).map((col) => {
				const delay = (col + row) * (0.5 / (size.y + size.x));
				this.addChild(
					new TransitionSquare({
						color: "#B27242",
						delay,
						size: ONE.mul(squareSize),
						pos: Vector(col, row).mul(squareSize),
					})
				);
			})
		);
	}
}
