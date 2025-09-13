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
	heirs?: GameObject[];
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

	father: GameObject | undefined;

	id: string | symbol;
	pos: Vector;
	opacity: number;
	scale: number;
	rotation: number;
	origin: Vector;
	size: Vector;
	frozen: boolean;
	heirs: GameObject[];
	pointCheckTolerance: Vector;

	constructor({
		pos = Vector(),
		opacity = 1,
		scale = 1,
		size = Vector(),
		origin = TOP_LEFT,
		rotation = 0,
		frozen = false,
		heirs = [],
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
		this.heirs = [];

		for (let key in unknownOptions) {
			this[key] = unknownOptions[key];
		}

		this.addChildren(heirs || []);
	}

	kill() {
		super.kill();
		if (this.father) {
			this.father.removeChild(this);
		}
		const children = this.heirs;
		children.map((child) => child.kill());
		this.heirs = [];
	}

	addChildren(heirs: GameObject[]) {
		heirs.map((child) => this.addChild(child));
	}

	addChild(child: GameObject, index = this.heirs.length) {
		if (child.father) {
			child.father.removeChild(child);
		}
		child.father = this;
		this.heirs.splice(index, 0, child);
		child.trigger(GAME_OBJECT_MOUNT_EVENT);
		this.trigger(GAME_OBJECT_CHILDREN_CHANGE_EVENT);
	}

	getChild<T extends GameObject>(id: string | symbol): T | undefined {
		for (const child of this.heirs) {
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
		this.heirs = this.heirs.filter((child) => child !== toRemove);
		this.trigger(GAME_OBJECT_CHILDREN_CHANGE_EVENT);
	}

	update(deltaT: number) {}

	render(ctx: OffscreenCanvasRenderingContext2D) {}

	getGlobalRotation(): number {
		if (this.father) {
			return this.rotation + this.father.getGlobalRotation();
		} else {
			return this.rotation;
		}
	}

	getGlobalScale(): number {
		if (this.father) {
			return this.scale * this.father.getGlobalScale();
		} else {
			return this.scale;
		}
	}

	getGlobalPosition(): Vector {
		const pos = this.pos;

		if (!this.father) {
			return pos;
		}

		const parentOrigin = this.father.size.mulv(this.father.origin);
		const positionInParent = rotateAroundOrigin(
			scaleFromOrigin(pos, this.father.getGlobalScale(), parentOrigin),
			this.father.getGlobalRotation(),
			parentOrigin
		);

		return positionInParent.add(this.father.getGlobalPosition());
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
