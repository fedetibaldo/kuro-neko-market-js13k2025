import { Observable } from "./observable";
import { Vector } from "./vector";

export type GameObjectArgs = {
	pos?: Vector;
	opacity?: number;
	scale?: number;
	rotation?: number;
	origin?: Vector;
	size?: Vector;
	frozen?: boolean;
	children?: GameObject[];
	[k: string]: unknown;
};

export class GameObject extends Observable {
	[k: string]: unknown;

	parent: GameObject | undefined;

	pos: Vector;
	opacity: number;
	scale: number;
	rotation: number;
	origin: Vector;
	size: Vector;
	frozen: boolean;
	children: GameObject[];

	constructor({
		pos = new Vector(),
		opacity = 1,
		scale = 1,
		size = new Vector(),
		origin = Vector.TOP_LEFT,
		rotation = 0,
		frozen = false,
		children = [],
		...unknownOptions
	}: GameObjectArgs = {}) {
		super();

		this.pos = pos;
		this.opacity = opacity;
		this.scale = scale;
		this.rotation = rotation;
		this.origin = origin;
		this.size = size;
		this.frozen = frozen;

		/**
		 * @type {GameObject[]}
		 */
		this.children = [];

		for (let key in unknownOptions) {
			this[key] = unknownOptions[key];
		}

		this.addChildren(children || []);
		this.addChildren(this.createChildren());
	}
	destroy() {
		super.destroy();
		if (this.parent) {
			this.parent.removeChild(this);
		}
		const children = this.children;
		this.children = [];
		children.forEach((child) => child.destroy());
	}

	createChildren(): GameObject[] {
		return [];
	}

	addChildren(children: GameObject[]) {
		children.forEach((child) => this.addChild(child));
	}

	addChild(child: GameObject, index = this.children.length) {
		child.parent = this;
		this.children[index] = child;
		child.trigger("mount");
		this.trigger("childrenChange");
	}

	getChild(id: string): GameObject | undefined {
		if (id === this.id) {
			return this;
		} else {
			for (let i = 0; i < this.children.length; i++) {
				let needle = this.children[i]?.getChild(id);
				if (needle) {
					return needle;
				}
			}
		}
	}

	get(prop: string): unknown {
		if (typeof this[prop] == "function") {
			return this[prop]();
		} else {
			return this[prop];
		}
	}

	removeChild(toRemove: GameObject) {
		const index = this.children.findIndex((child) => child === toRemove);
		this.children.splice(index, 1);
		this.trigger("childrenChange");
	}

	scaleAdjustment() {
		const A = this.size;
		const S = this.size.mul(this.scale);
		return A.diff(S).mulv(this.origin);
	}

	rotationAdjustment(
		vector: Vector,
		offset = Vector.ZERO,
		size = this.size,
		angle = this.rotation
	) {
		const O = offset.add(size.mulv(this.origin));
		const D = vector.diff(O);
		const Dr = D.rotate(angle);
		return O.add(Dr);
	}

	isPointWithinObject(point: Vector) {
		let pos = this.getGlobalPosition();
		const adjustedPos = pos.add(this.scaleAdjustment());
		const scaledSize = this.size.mul(this.scale);
		const adjustedPoint = this.rotationAdjustment(
			point,
			adjustedPos,
			scaledSize,
			-this.rotation
		);
		const { x, y } = adjustedPos;
		const { x: w, y: h } = scaledSize;
		return (
			adjustedPoint.x > x &&
			adjustedPoint.x < x + w &&
			adjustedPoint.y > y &&
			adjustedPoint.y < y + h
		);
	}

	update(deltaT: number) {
		this.children.forEach((child) => child.update(deltaT));
	}

	render(ctx: CanvasRenderingContext2D) {
		this.children.forEach(
			/**
			 * @param {GameObject} child
			 */
			(child) => {
				ctx.save();
				const pos = child.pos;
				ctx.translate(pos.x, pos.y);

				const scaleDiff = child.scaleAdjustment();
				ctx.translate(scaleDiff.x, scaleDiff.y);

				ctx.scale(child.scale, child.scale);

				const rotationDiff = child.rotationAdjustment(Vector.ZERO);
				ctx.translate(rotationDiff.x, rotationDiff.y);

				ctx.rotate(child.rotation);

				ctx.globalAlpha = child.opacity * this.getGlobalOpacity();
				// ctx.strokeStyle = "red";
				// child.size && ctx.strokeRect(0, 0, child.size.x, child.size.y);
				child.render(ctx);
				ctx.restore();
			}
		);
	}

	isFrozen(): boolean {
		const frozen = this.frozen;
		if (this.parent && !frozen) {
			return this.parent.isFrozen();
		}
		return frozen;
	}

	getGlobalOpacity(): number {
		if (this.parent) {
			return this.opacity * this.parent.getGlobalOpacity();
		} else {
			return this.opacity;
		}
	}

	getGlobalPosition(): Vector {
		if (this.parent) {
			return this.pos.add(this.parent.getGlobalPosition());
		} else {
			return this.pos;
		}
	}
}
