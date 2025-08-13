import { Observable } from "./observable";
import { Vector } from "./vector";

export class GameObject extends Observable<"childrenChange" | "mount"> {
	id: string | undefined;
	pos: Vector;
	opacity: number;
	scale: number;
	freezed: boolean;
	children: GameObject[];
	parent: GameObject | undefined;
	meta: Record<string, unknown>;

	constructor({
		id = undefined,
		pos = new Vector(),
		opacity = 1,
		scale = 1,
		freezed = false,
		children = [],
		...unknownOptions
	} = {}) {
		super();

		this.id = id;
		this.pos = pos;
		this.opacity = opacity;
		this.scale = scale;
		this.freezed = freezed;
		this.children = [];
		this.meta = {};

		for (let key in unknownOptions) {
			this.meta[key] = (unknownOptions as any)[key];
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
	createChildren() {
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
				let needle = this.children[i]!.getChild(id);
				if (needle) {
					return needle;
				}
			}
		}
	}
	get(prop: keyof GameObject | string) {
		const item =
			prop in this ? this[prop as keyof GameObject] : this.meta[prop];
		if (typeof item == "function") {
			return item();
		} else {
			return item;
		}
	}
	removeChild(toRemove: GameObject) {
		const index = this.children.findIndex((child) => child === toRemove);
		this.children.splice(index, 1);
		this.trigger("childrenChange");
	}
	update(deltaT: number) {
		this.children.forEach((child) => child.update(deltaT));
	}
	render(ctx: CanvasRenderingContext2D) {
		this.children.forEach((child) => {
			ctx.save();
			const { x, y } = child.pos.round();
			ctx.translate(x, y);
			ctx.scale(child.scale, child.scale);
			ctx.globalAlpha = child.opacity * this.getGlobalOpacity();
			// ctx.strokeStyle = 'red'
			// child.size && ctx.strokeRect(0, 0, child.size.x, child.size.y)
			child.render(ctx);
			ctx.restore();
		});
	}
	isFreezed(): boolean {
		const freezed = this.freezed;
		if (this.parent && !freezed) {
			return this.parent.isFreezed();
		}
		return freezed;
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
