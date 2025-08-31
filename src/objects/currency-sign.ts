import { Vector } from "../core/vector";
import { NewOmit } from "../utils/new-omit";
import { Glyph, GlyphArgs } from "./glyph";

type CurrencySignArgs = NewOmit<GlyphArgs, "path">;

export class CurrencySign extends Glyph {
	size = Vector(8, 9);

	constructor({ ...rest }: CurrencySignArgs) {
		super({
			path: "M6.5 3.5c-2.5-2.5-5 0-5 2s2 3.5 5 2M4.5 1v8.5",
			...rest,
		});
	}
}
