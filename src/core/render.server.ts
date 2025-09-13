import { rotateAroundOrigin, scaleFromOrigin } from "../utils/origin-helper";
import { GameObjectData } from "./game-object-data";
import { diContainer } from "./di-container";
import { Game, GAME_TICK_EVENT } from "./game";
import { Observable } from "./observable";
import { RenderableInterface, RendererInterface } from "./render.types";
import { ZERO } from "./vector";
import { unique } from "./unique";
// import { walk } from "../utils/walk";
// import { GameObject } from "./game-object";

export const RENDER_RENDER_EVENT = unique();

export class RenderServer extends Observable {
	game: Game;

	constructor() {
		super();
		this.game = diContainer.get(Game);
		this.game.on(GAME_TICK_EVENT, () => this.render());
	}

	render() {
		this.renderViewport(this.game.root);
		this.trigger(RENDER_RENDER_EVENT);
	}

	renderViewport(viewport: RendererInterface) {
		viewport.heirs.map((child) => {
			this.renderObject(viewport.ctx, child);
		});

		// walk<GameObject>(viewport as any, (obj) => {
		// 	const ctx = viewport.ctx;

		// 	ctx.save();
		// 	const pos = obj.getGlobalPosition();
		// 	ctx.translate(pos.x, pos.y);

		// 	const origin = obj.size.mulv(obj.origin);

		// 	const scale = obj.getGlobalScale();
		// 	const scaleDiff = scaleFromOrigin(ZERO, scale, origin);
		// 	ctx.translate(scaleDiff.x, scaleDiff.y);
		// 	ctx.scale(scale, scale);

		// 	const rotation = obj.getGlobalRotation();
		// 	const rotationDiff = rotateAroundOrigin(ZERO, rotation, origin);
		// 	ctx.translate(rotationDiff.x, rotationDiff.y);
		// 	ctx.rotate(rotation);

		// 	ctx.strokeStyle = "red";
		// 	obj.size && ctx.strokeRect(0, 0, obj.size.x, obj.size.y);

		// 	ctx.restore();
		// 	return obj.children;
		// });
	}

	renderObject(ctx: OffscreenCanvasRenderingContext2D, obj: GameObjectData) {
		const isRenderable = (obj: object): obj is RenderableInterface =>
			!!(obj as any).render;

		const isRenderer = (obj: object): obj is RendererInterface =>
			!!(obj as any).ctx;

		if (isRenderer(obj)) {
			this.renderViewport(obj);
			return;
		}

		const { pos, scale, rotation, opacity } = obj;

		ctx.save();
		// ctx.translate(pos.x, pos.y);

		const origin = obj.size.mulv(obj.origin);

		const scaleDiff = pos.add(scaleFromOrigin(ZERO, scale, origin));

		ctx.translate(scaleDiff.x, scaleDiff.y);
		if (scale != 1) {
			ctx.scale(scale, scale);
		}

		if (rotation != 0) {
			const rotationDiff = rotateAroundOrigin(ZERO, rotation, origin);
			ctx.translate(rotationDiff.x, rotationDiff.y);
			ctx.rotate(rotation);
		}

		ctx.globalAlpha = ctx.globalAlpha * opacity;
		// ctx.strokeStyle = "red";
		// obj.size && ctx.strokeRect(0, 0, obj.size.x, obj.size.y);

		if (isRenderable(obj)) {
			obj.render(ctx);
		}

		obj.heirs.map((child) => {
			this.renderObject(ctx, child);
		});

		ctx.restore();
	}
}
