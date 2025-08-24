import { Flexbox } from "../../core/flexbox";
import { GameObject } from "../../core/game-object";
import { Vector } from "../../core/vector";
import { PressableInterface } from "../../systems/interactable/interactable.types";
import { range } from "../../utils/range";
import { Digit, DigitValue } from "../digit";
import { Glyph } from "../glyph";
import { activeColor } from "./colors";

const buttonSize = new Vector(16, 16);
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
}

export class ButtonGroup extends GameObject {
	createChildren(): GameObject[] {
		const spaceBetween = -1;
		return [
			new Flexbox({
				pos: new Vector(4, 4),
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
											children: [
												new Digit({
													color: activeColor,
													fontSize,
													value: (row * 3 + col + 1) as DigitValue,
													pos: new Vector(3, 2.5),
													origin: Vector.CENTER,
												}),
											],
										})
								),
							})
					),
					new Flexbox({
						size: buttonSize,
						align: "start",
						direction: "row",
						justify: "start",
						spaceBetween,
						children: [
							new ButtonGroupButton({
								size: buttonSize,
								children: [
									new Glyph({
										color: "#8B2325",
										path: "m1.5 8 5-7m-5 0 5 7",
										fontSize,
										pos: new Vector(3, 2.5),
										origin: Vector.CENTER,
									}),
								],
							}),
							new ButtonGroupButton({
								size: buttonSize,
								children: [
									new Digit({
										color: activeColor,
										fontSize,
										value: 0,
										pos: new Vector(3, 2.5),
										origin: Vector.CENTER,
									}),
								],
							}),
							new ButtonGroupButton({
								size: buttonSize,
								children: [
									new Glyph({
										color: "#10A11A",
										path: "m1 4.7 2 3.1c.1.2.4.2.5 0L6.9 1",
										fontSize,
										pos: new Vector(3, 2.5),
										origin: Vector.CENTER,
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
