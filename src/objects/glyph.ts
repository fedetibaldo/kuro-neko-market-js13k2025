import { NewOmit } from "../utils/new-omit";
import { Svg, SvgArgs } from "./svg";

export type GlyphArgs = NewOmit<SvgArgs, "lineWidth"> & {
	fontSize?: number;
};

export class Glyph extends Svg {
	fontSize: number;

	constructor({ fontSize = 12, ...rest }: GlyphArgs) {
		super({ ...rest, lineWidth: 2 });
		this.fontSize = fontSize;
		this.scale = fontSize / 12;
	}
}
