import { Observable } from "./observable";
import { Vector } from "./vector";

/**
 * @member {GameObject[]} children
 */
export class GameObject extends Observable {
	/**
	 * @param {Object} args
	 * @param {GameObject[]} [args.children]
	 * @param {string} [args.id]
	 * @param {Vector} [args.pos]
	 * @param {Vector} [args.size]
	 */
	constructor({
		pos = new Vector(),
		opacity = 1,
		scale = 1,
		size = new Vector(),
		origin = Vector.TOP_LEFT,
		rotation = 0,
		freezed = false,
		children = [],
		...unknownOptions
	} = {}) {
		super();

		this.pos = pos;
		this.opacity = opacity;
		this.scale = scale;
		this.rotation = rotation;
		this.origin = origin;
		this.size = size;
		this.freezed = freezed;

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
	/**
	 * @returns {GameObject[]}
	 */
	createChildren() {
		return [];
	}
	addChildren(children) {
		children.forEach((child) => this.addChild(child));
	}
	addChild(child, index = this.children.length) {
		child.parent = this;
		this.children[index] = child;
		child.trigger("mount");
		this.trigger("childrenChange");
	}
	getChild(id) {
		if (id === this.id) {
			return this;
		} else {
			for (let i = 0; i < this.children.length; i++) {
				let needle = this.children[i].getChild(id);
				if (needle) {
					return needle;
				}
			}
		}
	}
	get(prop) {
		if (typeof this[prop] == "function") {
			return this[prop]();
		} else {
			return this[prop];
		}
	}
	removeChild(toRemove) {
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
		vector,
		offset = Vector.ZERO,
		size = this.size,
		angle = this.rotation
	) {
		const O = offset.add(size.mulv(this.origin));
		const D = vector.diff(O);
		const Dr = D.rotate(angle);
		return O.add(Dr);
	}

	/**
	 * @param {Vector} point
	 * @returns {boolean}
	 */
	isPointWithinObject(point) {
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

	/**
	 * @param {number} deltaT
	 */
	update(deltaT) {
		this.children.forEach((child) => child.update(deltaT));
	}
	/**
	 * @param {CanvasRenderingContext2D} ctx
	 */
	render(ctx) {
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
	isFreezed() {
		const freezed = this.freezed;
		if (this.parent && !freezed) {
			return this.parent.isFreezed();
		}
		return freezed;
	}
	getGlobalOpacity() {
		if (this.parent) {
			return this.opacity * this.parent.getGlobalOpacity();
		} else {
			return this.opacity;
		}
	}
	getGlobalPosition() {
		if (this.parent) {
			return this.pos.add(this.parent.getGlobalPosition());
		} else {
			return this.pos;
		}
	}
}
