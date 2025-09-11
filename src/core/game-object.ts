import { rotateAroundOrigin, scaleFromOrigin } from "../utils/origin-helper";
import { GameObjectData } from "./game-object-data";
import { unique } from "./unique";
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
	pointCheckTolerance?: Vector;
	[k: string]: unknown;
};

export const GAME_OBJECT_MOUNT_EVENT = unique();
export const GAME_OBJECT_CHILDREN_CHANGE_EVENT = unique();

export class GameObject
	extends Observable
	implements GameObjectData, RenderableInterface, UpdatableInterface
{
	[k: string]: unknown;

	parent: GameObject | undefined;

	id: string | symbol;
	pos: Vector;
	opacity: number;
	scale: number;
	rotation: number;
	origin: Vector;
	size: Vector;
	frozen: boolean;
	children: GameObject[];
	pointCheckTolerance: Vector;

	constructor({
		pos = Vector(),
		opacity = 1,
		scale = 1,
		size = Vector(),
		origin = TOP_LEFT,
		rotation = 0,
		frozen = false,
		children = [],
		pointCheckTolerance = ZERO,
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
		this.pointCheckTolerance = pointCheckTolerance;

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
	kill() {
		super.kill();
		if (this.parent) {
			this.parent.removeChild(this);
		}
		const children = this.children;
		children.forEach((child) => child.kill());
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
		child.trigger(GAME_OBJECT_MOUNT_EVENT);
		this.trigger(GAME_OBJECT_CHILDREN_CHANGE_EVENT);
	}

	getChild<T extends GameObject>(id: string | symbol): T | undefined {
		for (const child of this.children) {
			if (child.id === id) {
				return child as T;
			}
			const needle = child.getChild(id);
			if (needle) {
				return needle as T;
			}
		}
	}

	removeChild(toRemove: GameObject) {
		this.children = this.children.filter((child) => child !== toRemove);
		this.trigger(GAME_OBJECT_CHILDREN_CHANGE_EVENT);
	}

	update(deltaT: number) {}

	render(ctx: OffscreenCanvasRenderingContext2D) {}

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

	getGlobalPosition(): Vector {
		const pos = this.pos;

		if (!this.parent) {
			return pos;
		}

		const parentOrigin = this.parent.size.mulv(this.parent.origin);
		const positionInParent = rotateAroundOrigin(
			scaleFromOrigin(pos, this.parent.getGlobalScale(), parentOrigin),
			this.parent.getGlobalRotation(),
			parentOrigin
		);

		return positionInParent.add(this.parent.getGlobalPosition());
	}

	project(obj: GameObject) {
		const projectedScale = obj.getGlobalScale() / this.getGlobalScale();

		const objOrigin = obj.size.mulv(obj.origin);
		const localOrigin = this.toLocal(
			obj.getGlobalPosition().add(objOrigin.mul(projectedScale))
		);
		const projectedPosition = localOrigin.diff(objOrigin.mul(projectedScale));

		const projectedRotation = obj.rotation - this.getGlobalRotation();

		return {
			scale: projectedScale,
			pos: projectedPosition,
			rotation: projectedRotation,
		};
	}

	toGlobal(localPoint: Vector) {
		const position = this.getGlobalPosition();
		const rotation = this.getGlobalRotation();
		const scale = this.getGlobalScale();
		const origin = this.size.mulv(this.origin);

		const globalPoint = position.add(
			rotateAroundOrigin(
				scaleFromOrigin(localPoint, scale, origin),
				rotation,
				origin
			)
		);

		return globalPoint;
	}

	toLocal(point: Vector) {
		const pos = this.getGlobalPosition();
		const pointRelativeToPos = point.diff(pos);
		const origin = this.size.mulv(this.origin);

		const localPoint = rotateAroundOrigin(
			scaleFromOrigin(pointRelativeToPos, 1 / this.getGlobalScale(), origin),
			-this.getGlobalRotation(),
			origin
		);

		return localPoint;
	}

	isPointWithinObject(point: Vector) {
		const localPoint = this.toLocal(point);
		return (
			localPoint.gt(ZERO.diff(this.pointCheckTolerance)) &&
			localPoint.lt(this.size.add(this.pointCheckTolerance))
		);
	}
}
