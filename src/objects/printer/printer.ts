import { drawSvg } from "../../core/draw-svg";
import { Flexbox } from "../../core/flexbox";
import { GameObject } from "../../core/game-object";
import { IncrementalLerp, makeFixedTimeIncrementalLerp } from "../../core/lerp";
import { CENTER, Vector, VectorLike, ZERO } from "../../core/vector";
import { gradient } from "../../utils/gradient";
import { Digit, DigitValue } from "../digit";
import { Paper } from "../paper";
import { ButtonGroup } from "./button-group";
import { activeColor, inactiveColor } from "./colors";

class PrinterMiddleLayer extends GameObject {
	render(ctx: OffscreenCanvasRenderingContext2D): void {
		ctx.beginPath();
		ctx.roundRect(0, 0, 74, 66 + 7, 12);
		ctx.fillStyle = "#00000066";
		ctx.fill();

		ctx.beginPath();
		ctx.roundRect(0, 0, 74, 66, 12);
		ctx.fillStyle = gradient(ctx, ZERO, Vector(0, 2), [
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
		ctx.fillStyle = gradient(ctx, Vector(6, 6), Vector(6, 7), [
			[0, "#732182"],
			[1, "#D58DE2"],
		]);
		ctx.fill();
	}
}

export class Printer extends GameObject {
	size = Vector(74, 66);
	center = this.size.mul(1 / 2);
	origin = CENTER;

	value = [0, 0] as [DigitValue, DigitValue];
	leftDigit = this.getChild("left-digit") as Digit;
	rightDigit = this.getChild("right-digit") as Digit;
	buttons = this.getChild("buttons") as ButtonGroup;
	tickets = this.getChild("tickets") as GameObject;
	ticket = this.tickets.children[0] as Paper;

	ticketLerp: IncrementalLerp<Vector> | null = null;

	listeners = [
		this.buttons.on("value", (e: DigitValue) => this.pushValue(e)),
		this.buttons.on("clear", () => this.reset()),
		this.buttons.on("submit", () => this.onSubmit()),
	];

	["onDestroy"]() {
		this.listeners.forEach((off) => off());
	}

	reset() {
		this.pushValue(0);
		this.pushValue(0);
	}

	update(deltaT: number): void {
		if (this.ticketLerp) {
			this.ticket.pos = this.ticketLerp(deltaT);
		}
	}

	async onSubmit() {
		if (this.ticketLerp) return;
		const [left, right] = this.value;
		if (!left && !right) return;
		if (left) {
			this.ticket.addChild(new Digit({ value: left }));
		}
		this.ticket.addChild(new Digit({ value: right }));
		this.ticketLerp = makeFixedTimeIncrementalLerp(
			this.ticket.pos,
			this.ticket.pos.add(Vector(-21, 0)),
			500
		);

		await new Promise((resolve) => setTimeout(resolve, 500));

		const nextTicket = new Paper({ id: "ticket", pos: Vector(-2, 29) });
		this.tickets.addChild(nextTicket);

		this.ticket.canBePickedUp = true;
		this.ticketLerp = null;

		this.ticket = nextTicket;

		this.reset();
	}

	pushValue(value: DigitValue) {
		this.value = [this.value[1], value];
		const [leftDigitValue, rightDigitValue] = this.value;
		const leftColor = leftDigitValue ? activeColor : inactiveColor;
		const rightColor =
			leftDigitValue || rightDigitValue ? activeColor : inactiveColor;
		this.leftDigit.setValue(leftDigitValue);
		this.leftDigit.color = leftColor;
		this.rightDigit.setValue(rightDigitValue);
		this.rightDigit.color = rightColor;
	}

	createChildren(): GameObject[] {
		return [
			new GameObject({
				id: "tickets",
				children: [new Paper({ id: "ticket", pos: Vector(-2, 29) })],
			}),
			new PrinterMiddleLayer(),
			new Flexbox({
				pos: Vector(6, 7.5),
				size: Vector(20, 12),
				direction: "row",
				align: "start",
				justify: "center",
				spaceBetween: -2,
				children: [
					new Digit({
						id: "left-digit",
						color: inactiveColor,
						fontSize: 10,
						value: 0,
						origin: CENTER,
					}),
					new Digit({
						id: "right-digit",
						color: inactiveColor,
						fontSize: 10,
						value: 0,
						origin: CENTER,
					}),
				],
			}),
			new ButtonGroup({
				id: "buttons",
				pos: Vector(22, 0),
			}),
		];
	}
}
