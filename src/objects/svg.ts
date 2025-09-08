import { drawSvg } from "../core/draw-svg";
import { GameObject, GameObjectArgs } from "../core/game-object";
import { fill, stroke } from "../utils/draw";

export type SvgArgs = GameObjectArgs & {
	svgStrokeColor?: string;
	svgFillColor?: string;
	path: string;
	svgLineWidth?: number;
};

export class Svg extends GameObject {
	svgStrokeColor: string;
	svgFillColor?: string;
	path: string;
	svgLineWidth: number;

	constructor({
		svgStrokeColor = "#3A1141",
		svgFillColor,
		svgLineWidth = 1,
		path,
		...rest
	}: SvgArgs) {
		super(rest);
		this.path = path;
		this.svgStrokeColor = svgStrokeColor;
		this.svgFillColor = svgFillColor;
		this.svgLineWidth = svgLineWidth;
	}

	render(ctx: OffscreenCanvasRenderingContext2D): void {
		drawSvg(ctx, { path: this.path });
		stroke(ctx, this.svgStrokeColor, this.svgLineWidth);
		this.svgFillColor && fill(ctx, this.svgFillColor);
	}
}
