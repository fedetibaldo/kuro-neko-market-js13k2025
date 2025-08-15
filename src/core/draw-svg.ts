import { range } from "../utils/range";
import { Vector } from "./vector";

type NumberTuple<N> = N extends 0
	? []
	: N extends 1
	? [number]
	: N extends 2
	? [number, number]
	: N extends 3
	? [number, number, number]
	: N extends 4
	? [number, number, number, number]
	: N extends 5
	? [number, number, number, number, number]
	: N extends 6
	? [number, number, number, number, number, number]
	: number[];

type Exectutor<N> = (
	ctx: CanvasRenderingContext2D,
	args: NumberTuple<N>
) => void;

type Command<N extends number = number, M = N> = {
	isRelative?: boolean;
	argCount: N;
	prepareArgs?: (args: NumberTuple<N>, prevArgs: number[]) => NumberTuple<M>;
	execute: Exectutor<M>;
};

const moveTo: Exectutor<2> = (ctx, args) => {
	ctx.moveTo(...args);
};
const lineTo: Exectutor<2> = (ctx, args) => {
	ctx.lineTo(...args);
};
const bezierCurveTo: Exectutor<6> = (ctx, args) => {
	ctx.bezierCurveTo(...args);
};

const M: Command<2> = {
	argCount: 2,
	execute: moveTo,
};

const m: Command<2> = {
	isRelative: true,
	argCount: 2,
	prepareArgs(args, prevArgs) {
		return [(prevArgs.at(-2) || 0) + args[0], (prevArgs.at(-1) || 0) + args[1]];
	},
	execute: moveTo,
};

const L: Command<2> = {
	argCount: 2,
	execute: lineTo,
};

const l: Command<2> = {
	isRelative: true,
	argCount: 2,
	prepareArgs(args, prevArgs) {
		return [(prevArgs.at(-2) || 0) + args[0], (prevArgs.at(-1) || 0) + args[1]];
	},
	execute: lineTo,
};

const V: Command<1, 2> = {
	argCount: 1,
	prepareArgs(args, prevArgs) {
		return [prevArgs.at(-2)!, args[0]];
	},
	execute: lineTo,
};

const v: Command<1, 2> = {
	isRelative: true,
	argCount: 1,
	prepareArgs(args, prevArgs) {
		return [prevArgs.at(-2)!, prevArgs.at(-1)! - args[0]];
	},
	execute: lineTo,
};

const C: Command<6> = {
	argCount: 6,
	execute: bezierCurveTo,
};

const c: Command<6> = {
	isRelative: true,
	argCount: 6,
	prepareArgs(args, prevArgs) {
		return [
			prevArgs.at(-2)! + args[0],
			prevArgs.at(-1)! + args[1],
			prevArgs.at(-2)! + args[2],
			prevArgs.at(-1)! + args[3],
			prevArgs.at(-2)! + args[4],
			prevArgs.at(-1)! + args[5],
		];
	},
	execute: bezierCurveTo,
};

const getFirstControlPoint = (prevArgs: number[]): [number, number] => {
	return prevArgs.length < 4
		? [prevArgs.at(-2)!, prevArgs.at(-1)!]
		: [
				prevArgs.at(-2)! + prevArgs.at(-2)! - prevArgs.at(-4)!,
				prevArgs.at(-1)! + prevArgs.at(-1)! - prevArgs.at(-3)!,
		  ];
};

const S: Command<4, 6> = {
	argCount: 4,
	prepareArgs(args, prevArgs) {
		return [...getFirstControlPoint(prevArgs), ...args];
	},
	execute: bezierCurveTo,
};

const s: Command<4, 6> = {
	isRelative: true,
	argCount: 4,
	prepareArgs(args, prevArgs) {
		return [
			...getFirstControlPoint(prevArgs),
			prevArgs.at(-2)! + args[0],
			prevArgs.at(-1)! + args[1],
			prevArgs.at(-2)! + args[2],
			prevArgs.at(-1)! + args[3],
		];
	},
	execute: bezierCurveTo,
};

const Z: Command<0> = {
	argCount: 0,
	execute(ctx) {
		ctx.closePath();
	},
};

const z = Z;

const commands: Record<string, Command<number>> = {
	M,
	m,
	L,
	l,
	V,
	v,
	C,
	c,
	S,
	s,
	Z,
	z,
};

export function drawSvg(
	ctx: CanvasRenderingContext2D,
	{
		path,
		viewBox,
		flipH = false,
	}: { path: string; viewBox?: Vector; flipH?: boolean }
) {
	const getNextCommand = () => {
		let nextCommandIndex = path.search(/[A-Za-z]/);
		if (nextCommandIndex < 0) return;

		const name = path.at(nextCommandIndex)!;
		path = path.slice(nextCommandIndex + 1).trim();

		if (!(name in commands)) {
			throw new Error(`Unknown command: ${name}`);
		}

		return commands[name]!;
	};

	let command: Command<number> | undefined = getNextCommand();
	let prevArgs: number[] = [];

	if (command) {
		ctx.beginPath();
	}

	while (command) {
		const { isRelative, argCount, prepareArgs, execute } = command;

		let args = range(argCount).map(() => {
			const firstChar = path[0];
			const isNegative = firstChar == "-";
			const isDecimalAbbr = firstChar == ".";

			let wasSliced;
			if (isNegative || isDecimalAbbr) {
				wasSliced = true;
				path = path.slice(1);
			}

			const nextDotIndex = path.search(/\./);
			const nextNextDotIndex = path.slice(nextDotIndex + 1).search(/\./);
			const nextNotNumberIndex = path.search(/[-\sA-Za-z]/);

			let nextArgIndex =
				nextNextDotIndex >= 0
					? nextNotNumberIndex >= 0
						? Math.min(nextDotIndex + nextNextDotIndex + 1, nextNotNumberIndex)
						: nextDotIndex + nextNextDotIndex + 1
					: nextNotNumberIndex;

			if (nextArgIndex < 0) {
				nextArgIndex = path.length;
			}
			let arg = path.slice(0, nextArgIndex);
			path = path.slice(nextArgIndex).trim();

			if (wasSliced) {
				arg = `${firstChar}${arg}`;
			}

			return parseFloat(arg);
		});

		if (viewBox && flipH && isRelative) {
			args = args.map((value) => -value);
		}

		let readyArgs = prepareArgs ? prepareArgs(args, prevArgs) : args;

		if (viewBox && flipH && !isRelative) {
			readyArgs = readyArgs.map(
				(value) => viewBox.x / 2 + (viewBox.x / 2 - value)
			);
		}

		prevArgs = readyArgs;

		execute(ctx, readyArgs);

		if (path.search(/[-\.\d]/) != 0) {
			command = getNextCommand();
		} else {
			if (command === m) {
				command = l;
			}
		}
	}
}
