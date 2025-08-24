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

		const direction = new Vector();
		direction[mainAxis] = 1;

		const childrenCumulativeSize = this.children.reduce(
			(size, child) => size.add(child.size),
			new Vector()
		);
		const spaceBetweenVector = direction.mul(this.spaceBetween);
		const childrenTotalSize = childrenCumulativeSize.add(
			spaceBetweenVector.mul(this.children.length - 1)
		);

		const offset = new Vector();

		/* The main axis offset is global and increments child after child */

		// justify == 'start' -> offset[mainAxis] = 0 (already is)
		if (this.justify == "center") {
			offset[mainAxis] = this.size
				.mul(1 / 2)
				.diff(childrenTotalSize.mul(1 / 2))[mainAxis];
		} else if (this.justify == "end") {
			offset[mainAxis] = this.size.diff(childrenTotalSize)[mainAxis];
		}

		this.children.forEach((child) => {
			/* The secondary axis offset is local and child-dependent */

			// align == 'start' -> offset[secondaryAxis] = 0 (already is)
			if (this.align == "center") {
				offset[secondaryAxis] = this.size
					.mul(1 / 2)
					.diff(child.size.mul(1 / 2))[secondaryAxis];
			} else if (this.align == "end") {
				offset[secondaryAxis] = this.size.diff(child.size)[secondaryAxis];
			}

			child.pos = offset.floor();
			offset[mainAxis] += child.size[mainAxis] + spaceBetweenVector[mainAxis];
		});
	}
}
