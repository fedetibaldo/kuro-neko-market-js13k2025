import { diContainer } from "../core/di-container";
import { Game } from "../core/game";
import { Viewport } from "../core/viewport";

export const makePattern = (
	ctx: OffscreenCanvasRenderingContext2D,
	id: symbol
) => {
	return ctx.createPattern(
		(diContainer.get(Game).root.getChild(id) as Viewport).canvas,
		"repeat"
	)!;
};
