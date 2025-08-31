import { Vector } from "./vector";

type Tuple<N, T> = N extends 0
	? []
	: N extends 1
	? [T]
	: N extends 2
	? [T, T]
	: N extends 3
	? [T, T, T]
	: N extends 4
	? [T, T, T, T]
	: N extends 5
	? [T, T, T, T, T]
	: N extends 6
	? [T, T, T, T, T, T]
	: T[];

type NumberTuple<N> = Tuple<N, number>;

type Exectutor<N> = (
	ctx: OffscreenCanvasRenderingContext2D,
	args: NumberTuple<N>
) => void;

type Command<N extends number = number, M = N> = {
	isRelative?: boolean;
	args: Tuple<N, "x" | "y">;
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
	args: ["x", "y"],
	execute: moveTo,
};

const m: Command<2> = {
	isRelative: true,
	args: ["x", "y"],
	prepareArgs(args, prevArgs) {
		return [(prevArgs.at(-2) || 0) + args[0], (prevArgs.at(-1) || 0) + args[1]];
	},
	execute: moveTo,
};

const mFirst: Command<2> = {
	...M,
};

const L: Command<2> = {
	args: ["x", "y"],
	execute: lineTo,
};

const l: Command<2> = {
	isRelative: true,
	args: ["x", "y"],
	prepareArgs(args, prevArgs) {
		return [(prevArgs.at(-2) || 0) + args[0], (prevArgs.at(-1) || 0) + args[1]];
	},
	execute: lineTo,
};

const H: Command<1, 2> = {
	args: ["x"],
	prepareArgs(args, prevArgs) {
		return [args[0], prevArgs.at(-1)!];
	},
	execute: lineTo,
};

const h: Command<1, 2> = {
	isRelative: true,
	args: ["x"],
	prepareArgs(args, prevArgs) {
		return [prevArgs.at(-2)! + args[0], prevArgs.at(-1)!];
	},
	execute: lineTo,
};

const V: Command<1, 2> = {
	args: ["y"],
	prepareArgs(args, prevArgs) {
		return [prevArgs.at(-2)!, args[0]];
	},
	execute: lineTo,
};

const v: Command<1, 2> = {
	isRelative: true,
	args: ["y"],
	prepareArgs(args, prevArgs) {
		return [prevArgs.at(-2)!, prevArgs.at(-1)! + args[0]];
	},
	execute: lineTo,
};

const C: Command<6> = {
	args: ["x", "y", "x", "y", "x", "y"],
	execute: bezierCurveTo,
};

const c: Command<6> = {
	isRelative: true,
	args: ["x", "y", "x", "y", "x", "y"],
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
	args: ["x", "y", "x", "y"],
	prepareArgs(args, prevArgs) {
		return [...getFirstControlPoint(prevArgs), ...args];
	},
	execute: bezierCurveTo,
};

const s: Command<4, 6> = {
	isRelative: true,
	args: ["x", "y", "x", "y"],
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
	args: [],
	execute(ctx) {
		ctx.closePath();
	},
};

const z = Z;

const commands: Record<string, Command<number>> = {
	["M"]: M,
	["m"]: m,
	["L"]: L,
	["l"]: l,
	["H"]: H,
	["h"]: h,
	["V"]: V,
	["v"]: v,
	["C"]: C,
	["c"]: c,
	["S"]: S,
	["s"]: s,
	["Z"]: Z,
	["z"]: z,
};

export function drawSvg(
	ctx: OffscreenCanvasRenderingContext2D,
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
			throw new Error(/* `Unknown command: ${name}` */);
		}

		return commands[name]!;
	};

	let command: Command<number> | undefined = getNextCommand();
	let prevArgs: number[] = [];

	if (command) {
		ctx.beginPath();
	}

	if (command === m) {
		command = mFirst;
	}

	while (command) {
		const { isRelative, args, prepareArgs, execute } = command;

		function popArg(path: string) {
			let arg = "";

			const isValidNextChar = (char: string) => {
				return (
					(arg.length == 0 && char == "-") ||
					(char == "." && !arg.includes(".")) ||
					/\d/.test(char)
				);
			};

			while (typeof path[0] != "undefined" && isValidNextChar(path[0])) {
				arg += path[0];
				path = path.slice(1);
			}

			return [arg, path] as const;
		}

		let parsedArgs = args.map((argType) => {
			const [arg, slicedPath] = popArg(path);
			path = slicedPath.trim();

			let parsedArg = parseFloat(arg);

			if (viewBox && flipH && argType == "x") {
				if (isRelative) {
					parsedArg = -parsedArg;
				} else {
					parsedArg = viewBox.x / 2 + (viewBox.x / 2 - parsedArg);
				}
			}

			return parsedArg;
		});

		let readyArgs = prepareArgs
			? prepareArgs(parsedArgs, prevArgs)
			: parsedArgs;

		if (readyArgs.length) {
			prevArgs = readyArgs;
		}

		execute(ctx, readyArgs);

		if (path.search(/[-\.\d]/) != 0) {
			command = getNextCommand();
		} else {
			if (command === m || command === mFirst) {
				command = l;
			}
			if (command === M) {
				command = L;
			}
		}
	}
}
