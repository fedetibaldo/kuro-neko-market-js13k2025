import { drawSvg } from "../../core/draw-svg";
import { Flexbox } from "../../core/flexbox";
import {
	GAME_OBJECT_KILL_EVENT,
	GameObject,
	GameObjectArgs,
} from "../../core/game-object";
import { OffFunction } from "../../core/observable";
import { unique } from "../../core/unique";
import { CENTER, ONE, Vector, ZERO } from "../../core/vector";
import { fill, fillRoundRect, stroke } from "../../utils/draw";
import { gradient } from "../../utils/gradient";
import { Digit, DigitValue } from "../digit";
import { Paper } from "../paper";
import {
	BUTTON_GROUP_CLEAR_EVENT,
	BUTTON_GROUP_SUBMIT_EVENT,
	BUTTON_GROUP_VALUE_EVENT,
	ButtonGroup,
} from "./button-group";
import { activeColor, inactiveColor } from "./colors";

export const TICKET_ID = unique();

class PrinterMiddleLayer extends GameObject {
	render(ctx: OffscreenCanvasRenderingContext2D): void {
		fillRoundRect(ctx, ZERO, this.size.add(Vector(0, 7)), 12, "#00000066");

		fillRoundRect(
			ctx,
			ZERO,
			this.size,
			12,
			gradient(ctx, ZERO, Vector(0, 2), [
				[0, "#FFFFFF"],
				[1, "#F3DEF7"],
			])
		);

		const drawPanel = () =>
			drawSvg(ctx, {
				path: "M8 23.5h16c.8 0 1.5.7 1.5 1.5v34c0 .8-.7 1.5-1.5 1.5H12c-3 0-5.5-2.5-5.5-5.5V25c0-.8.7-1.5 1.5-1.5Z",
			});

		drawPanel();
		stroke(ctx, "white");

		ctx.translate(0, -1);
		drawPanel();
		stroke(ctx, "#C7B3CA");
		ctx.translate(0, 1);

		ctx.beginPath();
		ctx.arc(11, 54, 2, 0, Math.PI * 2, true);
		fill(ctx, "#C7B3CA");

		fillRoundRect(
			ctx,
			ONE.mul(6),
			Vector(20, 12),
			6,
			gradient(ctx, Vector(6, 6), Vector(6, 7), [
				[0, "#732182"],
				[1, "#D58DE2"],
			])
		);
	}
}

export class Printer extends GameObject {
	size = Vector(74, 66);
	center = this.size.mul(1 / 2);
	origin = CENTER;

	value = [0, 0] as [DigitValue, DigitValue];
	leftDigit: Digit;
	rightDigit: Digit;
	tickets: GameObject;
	ticket: Paper;
	listeners: OffFunction[];

	constructor(args: GameObjectArgs) {
		super(args);

		const buttons = new ButtonGroup({
			pos: Vector(25, 0),
		});

		this.ticket = new Paper({ id: TICKET_ID, pos: Vector(-2, 29) });
		this.tickets = new GameObject({
			children: [this.ticket],
		});

		this.leftDigit = new Digit({
			svgStrokeColor: inactiveColor,
			glyphFontSize: 10,
			value: 0,
			origin: CENTER,
		});
		this.rightDigit = new Digit({
			svgStrokeColor: inactiveColor,
			glyphFontSize: 10,
			value: 0,
			origin: CENTER,
		});

		this.addChildren([
			this.tickets,
			new PrinterMiddleLayer({ size: Vector(77, 66) }),
			new Flexbox({
				pos: Vector(15.5, 11.5),
				mode: "hug",
				origin: CENTER,
				direction: "row",
				align: "start",
				justify: "center",
				children: [this.leftDigit, this.rightDigit],
			}),
			buttons,
		]);

		this.listeners = [
			buttons.on(BUTTON_GROUP_VALUE_EVENT, (e: DigitValue) =>
				this.pushValue(e)
			),
			buttons.on(BUTTON_GROUP_CLEAR_EVENT, () => this.reset()),
			buttons.on(BUTTON_GROUP_SUBMIT_EVENT, () => this.onSubmit()),
		];

		this.on(GAME_OBJECT_KILL_EVENT, () => this.onKill());
	}

	onKill() {
		this.listeners.forEach((off) => off());
		this.leftDigit = null as any;
		this.rightDigit = null as any;
		this.tickets = null as any;
		this.ticket = null as any;
	}

	reset() {
		this.pushValue(0);
		this.pushValue(0);
	}

	async onSubmit() {
		if (this.ticketLerp) return;
		const [left, right] = this.value;
		if (!left && !right) return;
		if (left) {
			this.ticket.addChild(new Digit({ value: left }));
		}
		this.ticket.addChild(new Digit({ value: right }));
		this.ticket.value = left * 10 + right;
		this.ticket.vel = -21 / 0.5;
		this.ticket.canBePickedUp = true;

		await new Promise((resolve) => setTimeout(resolve, 500));

		const ticket = this.getChild(TICKET_ID);
		if (ticket) {
			this.ticket.vel = 0;
		}
		const nextTicket = new Paper({ id: TICKET_ID, pos: Vector(-2, 29) });
		this.tickets.addChild(nextTicket);
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
		this.leftDigit.svgStrokeColor = leftColor;
		this.rightDigit.setValue(rightDigitValue);
		this.rightDigit.svgStrokeColor = rightColor;
	}
}
