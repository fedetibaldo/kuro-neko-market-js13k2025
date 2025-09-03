import { Flexbox } from "../../core/flexbox";
import { GameObject } from "../../core/game-object";
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
			this.trigger("value", child.value);
		}
		this.trigger("press");
	}
}

export class ButtonGroup extends GameObject {
	createChildren(): GameObject[] {
		const spaceBetween = 0;
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
								children: range(3).map(
									(col) =>
										new ButtonGroupButton({
											size: buttonSize,
											["onValue"]: (e: DigitValue) => this.trigger("value", e),
											children: [
												new Digit({
													color: activeColor,
													fontSize,
													value: (row * 3 + col + 1) as DigitValue,
													pos: Vector(3, 2.5),
													origin: CENTER,
												}),
											],
										})
								),
							})
					),
					new Flexbox({
						size: lastRowButtonSize,
						align: "start",
						direction: "row",
						justify: "start",
						spaceBetween,
						children: [
							new ButtonGroupButton({
								size: lastRowButtonSize,
								["onPress"]: () => this.trigger("clear"),
								children: [
									new Glyph({
										color: "#8B2325",
										path: GLYPH_CROSS,
										fontSize,
										pos: Vector(3, 2.5),
										origin: CENTER,
									}),
								],
							}),
							new ButtonGroupButton({
								size: lastRowButtonSize,
								["onValue"]: (e: DigitValue) => this.trigger("value", e),
								children: [
									new Digit({
										color: activeColor,
										fontSize,
										value: 0,
										pos: Vector(3, 2.5),
										origin: CENTER,
									}),
								],
							}),
							new ButtonGroupButton({
								size: lastRowButtonSize.add(Vector(10, 0)),
								["onPress"]: () => this.trigger("submit"),
								children: [
									new Glyph({
										color: "#10A11A",
										path: GLYPH_TICK,
										fontSize,
										pos: Vector(3, 2.5),
										origin: CENTER,
									}),
								],
							}),
						],
					}),
				],
			}),
		];
	}
}
