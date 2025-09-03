import { GAME_OBJECT_CHILDREN_CHANGE_EVENT, GameObject } from "./game-object";
import { Vector } from "./vector";

export type FlexboxArgs = {
	direction?: "row" | "col";
	mode?: "fixed" | "hug";
	spaceBetween?: number;
	align?: "start" | "center" | "end";
	justify?: "start" | "center" | "end";
	[x: string]: any;
};

export class Flexbox extends GameObject {
	direction: "row" | "col";
	mode: "fixed" | "hug";
	spaceBetween: number;
	align: "start" | "center" | "end";
	justify: "start" | "center" | "end";

	constructor({
		direction = "row",
		mode = "fixed",
		spaceBetween = 0,
		align = "center",
		justify = "center",
		...rest
	}: FlexboxArgs) {
		super(rest);
		this.direction = direction;
		this.spaceBetween = spaceBetween;
		this.align = align;
		this.justify = justify;
		this.mode = mode;
		this.on(GAME_OBJECT_CHILDREN_CHANGE_EVENT, () => this.onChildrenChange());
		this.onChildrenChange();
	}
	onChildrenChange() {
		const mainAxis = this.direction == "row" ? "x" : "y";
		const secondaryAxis = this.direction == "row" ? "y" : "x";

		const direction = Vector(mainAxis == "x" ? 1 : 0, mainAxis == "y" ? 1 : 0);
		let maxSecondarySize = 0;

		const childrenCumulativeSize = this.children.reduce((size, child) => {
			const childSize = child.size.mul(child.scale);
			maxSecondarySize = Math.max(maxSecondarySize, childSize[secondaryAxis]);
			return size.add(childSize);
		}, Vector());
		const spaceBetweenVector = direction.mul(this.spaceBetween);
		const childrenTotalSize = childrenCumulativeSize.add(
			spaceBetweenVector.mul(this.children.length - 1)
		);
		if (this.mode == "hug") {
			const newSize = Vector(
				mainAxis == "x" ? childrenTotalSize.x : maxSecondarySize,
				mainAxis == "y" ? childrenTotalSize.y : maxSecondarySize
			);
			this.pos = this.pos
				.add(this.size.mulv(this.origin))
				.diff(newSize.mulv(this.origin));
			this.size = newSize;
			// Dirty, but works
			this.parent?.trigger(GAME_OBJECT_CHILDREN_CHANGE_EVENT);
		}

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
				secondaryOffset = this.size
					.mul(1 / 2)
					.diff(child.size.mul(child.scale).mul(1 / 2))[secondaryAxis];
			} else if (this.align == "end") {
				secondaryOffset = this.size.diff(child.size.mul(child.scale))[
					secondaryAxis
				];
			}

			child.pos = Vector(
				mainAxis == "x" ? mainOffset : secondaryOffset,
				mainAxis == "y" ? mainOffset : secondaryOffset
			); /* .floor(); */
			mainOffset +=
				child.size[mainAxis] * child.scale + spaceBetweenVector[mainAxis];
		});
	}
}
