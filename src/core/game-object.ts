import {
	getConcreteOrigin,
	rotateAroundOrigin,
	scaleFromOrigin,
} from "../utils/origin-helper";
import { GameObjectData } from "./game-object-data";
import { Observable } from "./observable";
import { RenderableInterface } from "./render.types";
import { UpdatableInterface } from "./update.types";
import { TOP_LEFT, Vector, ZERO } from "./vector";

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

export class GameObject
	extends Observable
	implements GameObjectData, RenderableInterface, UpdatableInterface
{
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
		pos = Vector(),
		opacity = 1,
		scale = 1,
		size = Vector(),
		origin = TOP_LEFT,
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

		this.addChildren(this.createChildren());
		this.addChildren(children || []);
	}
	destroy() {
		super.destroy();
		if (this.parent) {
			this.parent.removeChild(this);
		}
		const children = this.children;
		children.forEach((child) => child.destroy());
		this.children = [];
	}

	createChildren(): GameObject[] {
		return [];
	}

	addChildren(children: GameObject[]) {
		children.forEach((child) => this.addChild(child));
	}

	addChild(child: GameObject, index = this.children.length) {
		if (child.parent) {
			child.parent.removeChild(child);
		}
		child.parent = this;
		this.children.splice(index, 0, child);
		child.trigger("mount");
		this.trigger("childrenChange");
	}

	getChild(id: string): GameObject | undefined {
		for (const child of this.children) {
			if (child.id === id) {
				return child;
			}
			const needle = child.getChild(id);
			if (needle) {
				return needle;
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
		this.children = this.children.filter((child) => child !== toRemove);
		this.trigger("childrenChange");
	}

	update(deltaT: number) {}

	render(ctx: OffscreenCanvasRenderingContext2D) {}

	isFrozen(): boolean {
		const frozen = this.frozen;
		if (this.parent && !frozen) {
			return this.parent.isFrozen();
		}
		return frozen;
	}

	getGlobalRotation(): number {
		if (this.parent) {
			return this.rotation + this.parent.getGlobalRotation();
		} else {
			return this.rotation;
		}
	}

	getGlobalScale(): number {
		if (this.parent) {
			return this.scale * this.parent.getGlobalScale();
		} else {
			return this.scale;
		}
	}

	getPositionInSelf(v: Vector = ZERO): Vector {
		const origin = getConcreteOrigin(v, this.size, this.origin);
		const positionInSelf = rotateAroundOrigin(
			scaleFromOrigin(v, this.scale, origin),
			this.rotation,
			origin
		);
		return positionInSelf;
	}

	getGlobalPosition(): Vector {
		const positionInSelf = this.getPositionInSelf();

		const transformedPosition = this.pos.add(positionInSelf);

		if (!this.parent) {
			return transformedPosition;
		}

		const positionInParent = rotateAroundOrigin(
			scaleFromOrigin(transformedPosition, this.parent.getGlobalScale(), ZERO),
			this.parent.getGlobalRotation(),
			ZERO
		);

		return positionInParent.add(this.parent.getGlobalPosition());
	}

	toGlobal(localPoint: Vector) {
		const positionInSelfBeforeRotation = localPoint.mul(this.getGlobalScale());
		const positionInSelf = positionInSelfBeforeRotation.rotate(
			this.getGlobalRotation()
		);
		return positionInSelf.add(this.getGlobalPosition());
	}

	toLocal(point: Vector) {
		const pos = this.getGlobalPosition();
		const positionInSelf = point.diff(pos);
		const rotatedPositionInSelf = positionInSelf.rotate(-this.rotation);
		return scaleFromOrigin(
			rotatedPositionInSelf,
			this.getGlobalScale(),
			this.size.mulv(this.origin)
		);
	}

	isPointWithinObject(point: Vector) {
		const pos = this.getGlobalPosition();
		const scale = this.getGlobalScale();
		const rotation = this.getGlobalRotation();

		const localPoint = rotateAroundOrigin(
			scaleFromOrigin(point, 1 / scale, pos),
			-rotation,
			pos
		);

		const { x, y } = pos;
		const { x: w, y: h } = this.size;
		return (
			localPoint.x > x &&
			localPoint.x < x + w &&
			localPoint.y > y &&
			localPoint.y < y + h
		);
	}
}
