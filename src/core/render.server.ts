import {
	getConcreteOrigin,
	rotateAroundOrigin,
	scaleFromOrigin,
} from "../utils/origin-helper";
import { GameObjectData } from "./game-object-data";
import { diContainer } from "./di-container";
import { Game } from "./game";
import { Observable } from "./observable";
import { RenderableInterface, RendererInterface } from "./render.types";
import { ZERO } from "./vector";

export class RenderServer extends Observable {
	game: Game;

	constructor() {
		super();
		this.game = diContainer.get(Game);
		this.game.on("tick", () => this.render());
	}

	render() {
		this.renderViewport(this.game.root);
		this.trigger("render");
	}

	renderViewport(viewport: RendererInterface) {
		for (const child of viewport.children) {
			this.renderObject(viewport.ctx, child);
		}
	}

	renderObject(ctx: OffscreenCanvasRenderingContext2D, obj: GameObjectData) {
		const isRenderable = (obj: object): obj is RenderableInterface =>
			"render" in obj;

		const isRenderer = (obj: object): obj is RendererInterface => "ctx" in obj;

		if (isRenderer(obj)) {
			this.renderViewport(obj);
			return;
		}

		const { pos, scale, rotation, opacity } = obj;

		ctx.save();
		ctx.translate(pos.x, pos.y);

		const origin = getConcreteOrigin(ZERO, obj.size, obj.origin);

		const scaleDiff = scaleFromOrigin(ZERO, scale, origin);
		ctx.translate(scaleDiff.x, scaleDiff.y);
		ctx.scale(scale, scale);

		const rotationDiff = rotateAroundOrigin(ZERO, rotation, origin);
		ctx.translate(rotationDiff.x, rotationDiff.y);
		ctx.rotate(rotation);

		ctx.globalAlpha = ctx.globalAlpha * opacity;
		// ctx.strokeStyle = "red";
		// obj.size && ctx.strokeRect(0, 0, obj.size.x, obj.size.y);

		if (isRenderable(obj)) {
			obj.render(ctx);
		}

		for (const child of obj.children) {
			this.renderObject(ctx, child);
		}

		ctx.restore();
	}
}
