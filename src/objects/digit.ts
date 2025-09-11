import { Vector } from "../core/vector";
import { NewOmit } from "../utils/new-omit";
import { Glyph, GlyphArgs } from "./glyph";

const digits = {
	0: "M4 8C1.1 8 .8 1 4 1 7.2 1 6.9 8 4 8Z",
	1: "M2.5 2.7C3.4 2 3.8 1.5 4.4 1c.3-.3.3.3.3.6 0 .5 0 4.7 0 6.3",
	2: "M1.4 3.4c0-1 .4-2 2-2.4 1.5-.2 2.6.9 2.6 2 0 1.8-2.2 2.7-2.9 3.1-.4.2-1.3.8-1.5 1-.3.3-.3.6-.3.6.1 0 1 0 1.5 .1 1.7 0 3.7 0 3.7 0",
	3: "M1.8 6.4c.5 1.6 3 2.2 4 .6.3-.5.5-1.2 0-1.9-.4-.6-1.1-.8-1.8-.8-.1 0-.1 0 0 0 .7 0 1.4-.3 1.8-.9.3-.6.2-1.3-.3-1.8-.6-.6-2.5-.9-3.3.5",
	4: "M3 1S2.1 4.8 2 5.2c0 .1-.2.2.5.2l3.6 0m0 0V1m0 4.4v2.6",
	5: "M5.6 1c-1.2 0-1.4 0-2.6 0-.1 0-.3 0-.3.2-.2 1-.2 2-.5 3.3 0 .1 0 .2.1.2.1.1.3 0 .4-.1 1.2-1.1 3.1-.2 3.1 1.4 0 2.6-2.7 2.2-3.6 1.4",
	6: "M5.7 1c-1.1-.1-3 .6-3.6 3.3-.1.6-.1 1.2-.1 1.7m0 0c0 2.7 4 2.6 3.9 0 0-2.4-3.8-2.1-3.9 0Z",
	7: "M2 1.1c1.5 0 2.3 0 3.9 0 .3 0 .2.1.2.2 0 1.6-2.9 4.3-2.9 6.5v.3",
	8: "M4 4.3c-2.8 0-2.7 3.7 0 3.7S6.8 4.3 4 4.3Zm0 0c-2.3 0-2.4-3.3 0-3.3s2.3 3.3 0 3.3Z",
	9: "M2.4 7.9c2.5.1 4.2-2.5 3.3-5.6m-1.8-1.3c-2.4 0-2.5 3.4 0 3.4 2.5 0 2.4-3.4 0-3.4Z",
} as const;
export type DigitValue = keyof typeof digits;

export type DigitArgs = NewOmit<GlyphArgs, "path" | "svgFillColor"> & {
	value: DigitValue;
};

export class Digit extends Glyph {
	size = Vector(8, 9);
	value: DigitValue;

	constructor({ value, ...rest }: DigitArgs) {
		super({ path: digits[value], ...rest });
		this.value = value;
	}

	setValue(value: DigitValue) {
		this.path = digits[value];
		this.value = value;
	}
}
