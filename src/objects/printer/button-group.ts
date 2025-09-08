import { Flexbox } from "../../core/flexbox";
import { GameObject } from "../../core/game-object";
import { unique } from "../../core/unique";
import { CENTER, Vector } from "../../core/vector";
import { GLYPH_CROSS, GLYPH_TICK } from "../../data/glyphs";
import { PressableInterface } from "../../systems/interactable/interactable.types";
import { range } from "../../utils/range";
import { Digit, DigitValue } from "../digit";
import { Glyph } from "../glyph";
import { activeColor } from "./colors";

const buttonSize = Vector(14, 14);
const lastRowButtonSize = Vector(14, 32);
const fontSize = 10;

const BUTTON_VALUE_EVENT = unique();
const BUTTON_PRESS_EVENT = unique();

export class ButtonGroupButton
	extends GameObject
	implements PressableInterface
{
	baseLayer = 0.8;
	readonly canBePressed = true;

	getPressPoint(): Vector {
		return this.toGlobal(buttonSize.mul(1 / 2));
	}

	press() {
		const [child] = this.children;
		if (child instanceof Digit) {
			this.trigger(BUTTON_VALUE_EVENT, child.value);
		}
		this.trigger(BUTTON_PRESS_EVENT);
	}
}

export const BUTTON_GROUP_VALUE_EVENT = unique();
export const BUTTON_GROUP_CLEAR_EVENT = unique();
export const BUTTON_GROUP_SUBMIT_EVENT = unique();

export class ButtonGroup extends GameObject {
	createChildren(): GameObject[] {
		const spaceBetween = 0;
		const buttons = range(10).map((idx) => {
			const value = idx as DigitValue;
			const button = new ButtonGroupButton({
				size: buttonSize,
				children: [
					new Digit({
						color: activeColor,
						glyphFontSize: fontSize,
						value,
						pos: Vector(3, 2.5),
						origin: CENTER,
					}),
				],
			});
			button.on(BUTTON_VALUE_EVENT, (e: DigitValue) =>
				this.trigger(BUTTON_GROUP_VALUE_EVENT, e)
			);
			return button;
		});

		const clearButton = new ButtonGroupButton({
			size: lastRowButtonSize,
			children: [
				new Glyph({
					svgStrokeColor: "#8B2325",
					path: GLYPH_CROSS,
					glyphFontSize: fontSize,
					pos: Vector(3, 2.5),
					origin: CENTER,
				}),
			],
		});
		clearButton.on(BUTTON_PRESS_EVENT, () =>
			this.trigger(BUTTON_GROUP_CLEAR_EVENT)
		);

		const submitButton = new ButtonGroupButton({
			size: lastRowButtonSize.add(Vector(10, 0)),
			children: [
				new Glyph({
					svgStrokeColor: "#10A11A",
					path: GLYPH_TICK,
					glyphFontSize: fontSize,
					pos: Vector(3, 2.5),
					origin: CENTER,
				}),
			],
		});
		submitButton.on(BUTTON_PRESS_EVENT, () =>
			this.trigger(BUTTON_GROUP_SUBMIT_EVENT)
		);

		return [
			new Flexbox({
				pos: Vector(4, 4),
				align: "start",
				direction: "col",
				justify: "start",
				spaceBetween,
				children: [
					...range(3).map(
						(row) =>
							new Flexbox({
								size: buttonSize,
								align: "start",
								direction: "row",
								justify: "start",
								spaceBetween,
								children: buttons.slice(1 + row * 3, 1 + row * 3 + 3),
							})
					),
					new Flexbox({
						size: lastRowButtonSize,
						align: "start",
						direction: "row",
						justify: "start",
						spaceBetween,
						children: [clearButton, buttons[0]!, submitButton],
					}),
				],
			}),
		];
	}
}
