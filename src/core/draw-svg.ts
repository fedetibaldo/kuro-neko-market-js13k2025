export function drawSvg(ctx: CanvasRenderingContext2D, path: string) {
	let nextCommandIndex = path.search(/[A-Z]/);
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
		}
		const parsedArgs = args
			.split(/\s/)
			.filter(Boolean)
			.map((arg) => parseFloat(arg));
		switch (command) {
			case "M":
				ctx.moveTo(...(parsedArgs as [number, number]));
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
				ctx.closePath();
				break;
			default:
				throw new Error(`Unknown command: ${command}`);
		}
	}
}
