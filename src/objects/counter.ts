import { Flexbox } from "../core/flexbox";
import { GameObjectArgs } from "../core/game-object";
import { NewOmit } from "../utils/new-omit";
import { Digit, DigitArgs, DigitValue } from "./digit";

type CounterArgs = GameObjectArgs &
	NewOmit<DigitArgs, "value"> & { value?: number };

export class Counter extends Flexbox {
	longestLength = 1;
	digitArgs: NewOmit<DigitArgs, "value">;

	constructor({
		glyphFontSize,
		svgStrokeColor,
		value = 0,
		...rest
	}: CounterArgs) {
		super({
			...rest,
			mode: "hug",
			align: "end",
			justify: "start",
			spaceBetween: -2,
		});
		this.digitArgs = { glyphFontSize, svgStrokeColor };
		this.setValue(value);
	}

	setValue(value: number) {
		const stringValue = `${value}`;
		this.longestLength = Math.max(stringValue.length, this.longestLength);
		let opacity = 0;
		for (const [index, digit] of stringValue
			.padStart(this.longestLength, "0")
			.split("")
			.entries()) {
			const digitValue = Number(digit) as DigitValue;
			if (digitValue != 0 || index == stringValue.length - 1) {
				opacity = 1;
			}
			const id = `${index}`;
			let digitObject = this.getChild(id) as Digit | undefined;
			if (!digitObject) {
				digitObject = new Digit({
					...this.digitArgs,
					id,
					value: digitValue,
					opacity: 0,
				});
				this.addChild(digitObject);
			}
			digitObject.setValue(digitValue);
			digitObject.opacity = opacity;
		}
	}
}
