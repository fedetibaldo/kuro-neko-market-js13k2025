import { NewOmit } from "../utils/new-omit";
import { Svg, SvgArgs } from "./svg";

export type GlyphArgs = NewOmit<SvgArgs, "lineWidth"> & {
	glyphFontSize?: number;
};

export class Glyph extends Svg {
	glyphFontSize: number;

	constructor({ glyphFontSize = 12, ...rest }: GlyphArgs) {
		super({ ...rest, svgLineWidth: 2 });
		this.glyphFontSize = glyphFontSize;
		this.scale = glyphFontSize / 12;
	}
}
