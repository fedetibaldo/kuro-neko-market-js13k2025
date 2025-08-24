import { GameObjectData } from "./game-object-data";

export type RenderableInterface = GameObjectData & {
	render(ctx: OffscreenCanvasRenderingContext2D): void;
};

export type RendererInterface = GameObjectData & {
	canvas: OffscreenCanvas;
	ctx: OffscreenCanvasRenderingContext2D;
};
