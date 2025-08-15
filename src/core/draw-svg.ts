import { Vector } from "./vector";

export function drawSvg(
	ctx: CanvasRenderingContext2D,
	{
		path,
		viewBox,
		flipH = false,
	}: { path: string; viewBox?: Vector; flipH?: boolean }
) {
	let nextCommandIndex = path.search(/[A-Z]/);
	let previousArgs: number[] = [];
	if (nextCommandIndex >= 0) {
		ctx.beginPath();
	}
	while (nextCommandIndex >= 0) {
		const command = path.at(nextCommandIndex);
		path = path.slice(nextCommandIndex + 1);
		nextCommandIndex = path.search(/[A-Z]/);
		let args = "";
		if (nextCommandIndex >= 0) {
			args = path.slice(0, nextCommandIndex);
			path = path.slice(nextCommandIndex);
			nextCommandIndex = path.search(/[A-Z]/);
		} else {
			args = path;
			path = "";
		}
		let parsedArgs = args
			.split(/\s/)
			.filter(Boolean)
			.map((arg) => parseFloat(arg));
		if (viewBox && flipH) {
			parsedArgs = parsedArgs.map((value) => value - viewBox.x / 2);
		}
		switch (command) {
			case "M":
				ctx.moveTo(...(parsedArgs as [number, number]));
				break;
			case "V":
				ctx.lineTo(previousArgs.at(-2) as number, ...(parsedArgs as [number]));
				break;
			case "C":
				ctx.bezierCurveTo(
					...(parsedArgs as [number, number, number, number, number, number])
				);
				break;
			case "L":
				ctx.lineTo(...(parsedArgs as [number, number]));
				break;
			case "Z":
				break;
			default:
				throw new Error(`Unknown command: ${command}`);
		}
		previousArgs = parsedArgs;
	}
	ctx.closePath();
}
