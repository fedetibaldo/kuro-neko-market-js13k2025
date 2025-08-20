import { drawSvg } from "../core/draw-svg";
import { Flexbox } from "../core/flexbox";
import { GameObject } from "../core/game-object";
import { Vector } from "../core/vector";
import { createLinearGradient } from "../utils/create-linear-gradient";
import { range } from "../utils/range";
import { Digit, DigitValue } from "./digit";
import { Glyph } from "./glyph";

const activeColor = "#3A1141";
const inactiveColor = "#B674C2";

export class Printer extends GameObject {
	value = 0;
	leftDigit = this.getChild("left-digit") as Digit;
	rightDigit = this.getChild("right-digit") as Digit;

	setValue(value: number) {
		this.value = value;
		const digitValues = value.toString().split("").reverse();
		const leftDigitValue = parseInt(digitValues[1] ?? "0") as DigitValue;
		const rightDigitValue = parseInt(digitValues[0] ?? "0") as DigitValue;
		const leftColor = leftDigitValue ? activeColor : inactiveColor;
		const rightColor =
			leftDigitValue || rightDigitValue ? activeColor : inactiveColor;
		this.leftDigit.setValue(leftDigitValue);
		this.leftDigit.color = leftColor;
		this.rightDigit.setValue(rightDigitValue);
		this.rightDigit.color = rightColor;
	}

	createChildren(): GameObject[] {
		const fontSize = 10;

		const setRandomValue = () => {
			const isTeen = Math.random() > 0.75;
			let value = Math.random() * 10 + 1 + (isTeen ? 10 : 0);
			this.setValue(Math.floor(value));
			setTimeout(setRandomValue, 1_000);
		};
		setTimeout(setRandomValue, 1_000);

		const display = new Flexbox({
			pos: new Vector(6, 7.5),
			size: new Vector(20, 12),
			direction: "row",
			align: "start",
			justify: "center",
			spaceBetween: -2,
			children: [
				new Digit({
					id: "left-digit",
					color: inactiveColor,
					fontSize,
					value: 0,
					origin: Vector.CENTER,
				}),
				new Digit({
					id: "right-digit",
					color: inactiveColor,
					fontSize,
					value: 0,
					origin: Vector.CENTER,
				}),
			],
		});

		const buttonSize = new Vector(12, 12);
		const spaceBetween = 2;

		const buttonGroup = new Flexbox({
			pos: new Vector(28, 6),
			align: "start",
			direction: "col",
			justify: "start",
			spaceBetween: 2,
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
									new GameObject({
										size: buttonSize,
										children: [
											new Digit({
												color: activeColor,
												fontSize,
												value: (row * 3 + col + 1) as DigitValue,
												pos: new Vector(2, 1.5),
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
						new GameObject({
							size: buttonSize,
							children: [
								new Glyph({
									color: "#8B2325",
									path: "m1.5 8 5-7m-5 0 5 7",
									fontSize,
									pos: new Vector(2, 1.5),
									origin: Vector.CENTER,
								}),
							],
						}),
						new GameObject({
							size: buttonSize,
							children: [
								new Digit({
									color: activeColor,
									fontSize,
									value: 0,
									pos: new Vector(2, 1.5),
									origin: Vector.CENTER,
								}),
							],
						}),
						new GameObject({
							size: buttonSize,
							children: [
								new Glyph({
									color: "#10A11A",
									path: "m1 4.7 2 3.1c.1.2.4.2.5 0L6.9 1",
									fontSize,
									pos: new Vector(2, 1.5),
									origin: Vector.CENTER,
								}),
							],
						}),
					],
				}),
			],
		});

		return [display, buttonGroup];
	}
	render(ctx: CanvasRenderingContext2D): void {
		ctx.beginPath();
		ctx.roundRect(0, 0, 74, 66 + 7, 12);
		ctx.fillStyle = "#00000066";
		ctx.fill();

		ctx.beginPath();
		ctx.roundRect(0, 0, 74, 66, 12);
		ctx.fillStyle = createLinearGradient(ctx, Vector.ZERO, new Vector(0, 2), [
			[0, "#FFFFFF"],
			[1, "#F3DEF7"],
		]);
		ctx.fill();

		const drawPanel = () =>
			drawSvg(ctx, {
				path: "M8 23.5h16c.8 0 1.5.7 1.5 1.5v34c0 .8-.7 1.5-1.5 1.5H12c-3 0-5.5-2.5-5.5-5.5V25c0-.8.7-1.5 1.5-1.5Z",
			});

		drawPanel();
		ctx.strokeStyle = "#FFFFFF";
		ctx.stroke();

		ctx.translate(0, -1);
		drawPanel();
		ctx.strokeStyle = "#C7B3CA";
		ctx.stroke();
		ctx.translate(0, 1);

		ctx.beginPath();
		ctx.arc(11, 54, 2, 0, Math.PI * 2, true);
		ctx.fillStyle = "#C7B3CA";
		ctx.fill();

		ctx.beginPath();
		ctx.roundRect(6, 6, 20, 12, 6);
		ctx.fillStyle = createLinearGradient(
			ctx,
			new Vector(6, 6),
			new Vector(6, 7),
			[
				[0, "#732182"],
				[1, "#D58DE2"],
			]
		);
		ctx.fill();

		super.render(ctx);
	}
}
