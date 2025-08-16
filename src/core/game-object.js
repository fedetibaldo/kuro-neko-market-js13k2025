import { Observable } from "./observable";
import { Vector } from "./vector";

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

				const A = child.size;
				const S = child.size.mul(child.scale);
				const scaleDiff = A.diff(S).mulv(child.origin);
				ctx.translate(scaleDiff.x, scaleDiff.y);

				ctx.scale(child.scale, child.scale);

				const O = child.size.mulv(child.origin);
				const D = Vector.ZERO.diff(O);
				const Dr = D.rotate(child.rotation);
				const Oi = O.add(Dr);
				ctx.translate(Oi.x, Oi.y);

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
