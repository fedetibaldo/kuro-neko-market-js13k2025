import { drawSvg } from "../core/draw-svg";
import { GameObject, GameObjectArgs } from "../core/game-object";

export type GlyphArgs = GameObjectArgs & {
	color?: string;
	fontSize?: number;
	path: string;
};

export class Glyph extends GameObject {
	color: string;
	fontSize: number;
	path: string;

	constructor({ color = "#000000", fontSize = 12, path, ...rest }: GlyphArgs) {
		super(rest);
		this.path = path;
		this.color = color;
		this.fontSize = fontSize;
		this.scale = fontSize / 12;
	}

	render(ctx: CanvasRenderingContext2D): void {
		drawSvg(ctx, { path: this.path });
		ctx.lineWidth = 2;
		ctx.lineCap = "round";
		ctx.strokeStyle = this.color;
		ctx.stroke();

		super.render(ctx);
	}
}
