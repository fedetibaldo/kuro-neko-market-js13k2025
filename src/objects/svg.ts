import { drawSvg } from "../core/draw-svg";
import { GameObject, GameObjectArgs } from "../core/game-object";

export type SvgArgs = GameObjectArgs & {
	color?: string;
	path: string;
	lineWidth?: number;
};

export class Svg extends GameObject {
	color: string;
	path: string;
	lineWidth: number;

	constructor({ color = "#3A1141", lineWidth = 1, path, ...rest }: SvgArgs) {
		super(rest);
		this.path = path;
		this.color = color;
		this.lineWidth = lineWidth;
	}

	render(ctx: OffscreenCanvasRenderingContext2D): void {
		drawSvg(ctx, { path: this.path });
		ctx.lineWidth = this.lineWidth;
		ctx.lineCap = "round";
		ctx.lineJoin = "round";
		ctx.strokeStyle = this.color;
		ctx.stroke();
	}
}
