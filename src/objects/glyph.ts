import { NewOmit } from "../utils/new-omit";
import { Svg, SvgArgs } from "./svg";

export type GlyphArgs = NewOmit<SvgArgs, "svgLineWidth"> & {
	glyphFontSize?: number;
};

export class Glyph extends Svg {
	constructor({ glyphFontSize = 12, ...rest }: GlyphArgs) {
		super({ ...rest, svgLineWidth: 2 });
		this.scale = glyphFontSize / 12;
	}
}
