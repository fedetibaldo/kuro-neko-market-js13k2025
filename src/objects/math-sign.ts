import { Vector } from "../core/vector";
import { NewOmit } from "../utils/new-omit";
import { Glyph, GlyphArgs } from "./glyph";

type MathSignArgs = NewOmit<GlyphArgs, "path"> & {
	value: number;
};

export class MathSign extends Glyph {
	constructor({ value, ...rest }: MathSignArgs) {
		const isPositive = Math.sign(value) >= 0;
		const path = isPositive ? "M3.5 4v4m-2-2h4" : "M1.5 6h3";
		const size = Vector(isPositive ? 7 : 6, 9);
		super({ path, size, ...rest });
	}
}
