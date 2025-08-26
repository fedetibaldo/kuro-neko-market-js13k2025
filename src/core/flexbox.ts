import { GameObject } from "./game-object";
import { Vector } from "./vector";

export type FlexboxArgs = {
	direction?: "row" | "col";
	spaceBetween?: number;
	align?: "start" | "center" | "end";
	justify?: "start" | "center" | "end";
	[x: string]: any;
};

export class Flexbox extends GameObject {
	direction: "row" | "col";
	spaceBetween: number;
	align: "start" | "center" | "end";
	justify: "start" | "center" | "end";

	constructor({
		direction = "row",
		spaceBetween = 0,
		align = "center",
		justify = "center",
		...rest
	}: FlexboxArgs) {
		super({ direction, spaceBetween, align, justify, ...rest });
	}
	onChildrenChange() {
		const mainAxis = this.direction == "row" ? "x" : "y";
		const secondaryAxis = this.direction == "row" ? "y" : "x";

		const direction = Vector(mainAxis == "x" ? 1 : 0, mainAxis == "y" ? 1 : 0);

		const childrenCumulativeSize = this.children.reduce(
			(size, child) => size.add(child.size),
			Vector()
		);
		const spaceBetweenVector = direction.mul(this.spaceBetween);
		const childrenTotalSize = childrenCumulativeSize.add(
			spaceBetweenVector.mul(this.children.length - 1)
		);

		let mainOffset = 0;
		let secondaryOffset = 0;

		/* The main axis offset is global and increments child after child */

		// justify == 'start' -> offset[mainAxis] = 0 (already is)
		if (this.justify == "center") {
			mainOffset = this.size.mul(1 / 2).diff(childrenTotalSize.mul(1 / 2))[
				mainAxis
			];
		} else if (this.justify == "end") {
			mainOffset = this.size.diff(childrenTotalSize)[mainAxis];
		}

		this.children.forEach((child) => {
			/* The secondary axis offset is local and child-dependent */

			// align == 'start' -> offset[secondaryAxis] = 0 (already is)
			if (this.align == "center") {
				secondaryOffset = this.size.mul(1 / 2).diff(child.size.mul(1 / 2))[
					secondaryAxis
				];
			} else if (this.align == "end") {
				secondaryOffset = this.size.diff(child.size)[secondaryAxis];
			}

			child.pos = Vector(
				mainAxis == "x" ? mainOffset : secondaryOffset,
				mainAxis == "y" ? mainOffset : secondaryOffset
			); /* .floor(); */
			mainOffset += child.size[mainAxis] + spaceBetweenVector[mainAxis];
		});
	}
}
