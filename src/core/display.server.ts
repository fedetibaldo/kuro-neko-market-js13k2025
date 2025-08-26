import { diContainer } from "./di-container";
import { Game } from "./game";
import { RenderServer } from "./render.server";
import { Vector } from "./vector";

type DisplayServerArgs = {
	canvas: HTMLCanvasElement;
};

export class DisplayServer {
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;

	game: Game;
	renderServer: RenderServer;

	// Set by fitScreen()
	canvasSize: Vector;
	viewRes: Vector;
	viewPos: Vector;
	viewSize: Vector;

	constructor({ canvas }: DisplayServerArgs) {
		this.canvas = canvas;
		this.ctx = this.canvas.getContext("2d")!;

		this.game = diContainer.get(Game);
		this.renderServer = diContainer.get(RenderServer);

		this.fitScreen();

		window.addEventListener("resize", () => this.fitScreen());
		this.renderServer.on("render", () => this.draw());
	}

	fitScreen() {
		const computedStyle = window.getComputedStyle(this.canvas);

		this.canvasSize = Vector(
			parseInt(computedStyle.width),
			parseInt(computedStyle.height)
		);

		this.canvas.width = this.canvasSize.x;
		this.canvas.height = this.canvasSize.y;

		this.ctx.imageSmoothingEnabled = false;

		const rootViewport = this.game.root;
		this.viewRes = rootViewport.size;

		const upscaleFactor = Math.min(
			this.canvasSize.x / this.viewRes.x,
			this.canvasSize.y / this.viewRes.y
		);

		this.viewSize = Vector(
			this.viewRes.x * upscaleFactor,
			this.viewRes.y * upscaleFactor
		);

		this.viewPos = this.canvasSize.diff(this.viewSize).mul(1 / 2);
	}

	draw() {
		const rootViewport = this.game.root;
		this.ctx.drawImage(
			rootViewport.canvas,
			0,
			0,
			this.viewRes.x,
			this.viewRes.y,
			this.viewPos.x,
			this.viewPos.y,
			this.viewSize.x,
			this.viewSize.y
		);
	}
}
