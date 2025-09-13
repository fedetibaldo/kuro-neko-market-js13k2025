import { Viewport } from "../../core/viewport";
import { drawSvg } from "../../core/draw-svg";
import { GameObject, GameObjectArgs } from "../../core/game-object";
import { CENTER, TOP_LEFT, Vector, ZERO } from "../../core/vector";
import { gradient } from "../../utils/gradient";
import { FishEye } from "./fish-eye";
import { Svg } from "../svg";
import { LevelSystem } from "../../systems/level/level.system";
import { VariedFish } from "../../data/fish-types";
import { fill, stroke } from "../../utils/draw";

type FishGraphicArgs = GameObjectArgs & {
	flipH?: boolean;
	type: VariedFish;
	overrideColor?: string;
	isShadowHidden?: boolean;
};

export class FishGraphic extends GameObject {
	level: LevelSystem;

	flipH: boolean;
	type: VariedFish;

	center: Vector;
	texture: Viewport;

	eyes: GameObject[];

	isShadowHidden: boolean;
	overrideColor: string | null;

	constructor({
		flipH = false,
		type,
		overrideColor,
		size,
		origin,
		isShadowHidden = false,
		...rest
	}: FishGraphicArgs) {
		super(rest);

		this.flipH = flipH;
		this.type = type;
		this.size = size ?? this.type.size;
		// Uknown bug: when child of flex, only TOP_LEFT results in correct global computations
		this.origin = origin ?? CENTER;
		this.overrideColor = overrideColor ?? null;
		this.isShadowHidden = isShadowHidden;

		const createEye = (pos: Vector, diameter: number, size: Vector) => {
			const eyeXPolar = pos.x - size.x / 2;
			return new FishEye({
				size: Vector(diameter, diameter),
				color: type.eyeColor,
				pos: Vector(
					size.x / 2 +
						eyeXPolar * (this.flipH ? -1 : 1) -
						(this.flipH ? diameter : 0),
					pos.y
				),
			});
		};

		this.texture = new Viewport({
			size: Vector(16, 16),
			heirs: [new Svg({ path: type.pattern, size: Vector(16, 16) })],
		});

		this.eyes = type.eyes.map(([diameter, pos]) =>
			createEye(pos, diameter, type.size)
		);

		this.addChildren([...this.eyes, this.texture]);
	}

	kill() {
		super.kill();
		this.eyes = [];
		this.texture = null as any;
	}

	update(): void {
		this.eyes.map((eye) => (eye.opacity = this.overrideColor ? 0 : 1));
	}

	render(ctx: OffscreenCanvasRenderingContext2D) {
		if (!this.isShadowHidden) {
			drawSvg(ctx, {
				path: this.type.shadow,
				viewBox: this.size,
				flipH: this.flipH,
			});
			fill(ctx, "#00000044");
		}
		drawSvg(ctx, {
			path: this.type.tail,
			viewBox: this.size,
			flipH: this.flipH,
		});
		fill(
			ctx,
			this.overrideColor ??
				gradient(ctx, Vector(0, 0), Vector(0, this.size.y + 10), [
					[0.85, this.type.tailFill1],
					[0.95, this.type.tailFill2],
				])
		);
		drawSvg(ctx, {
			path: this.type.body,
			viewBox: this.size,
			flipH: this.flipH,
		});
		fill(
			ctx,
			this.overrideColor ??
				gradient(
					ctx,
					ZERO,
					Vector(this.size.x, 0),
					[
						[0.2, this.type.bodyFill2],
						[0.8, this.type.bodyFill1],
					],
					{ flipH: this.flipH }
				)
		);
		fill(ctx, ctx.createPattern(this.texture.canvas, "repeat")!);
		drawSvg(ctx, {
			path: this.type.details,
			viewBox: this.size,
			flipH: this.flipH,
		});
		stroke(ctx, this.overrideColor ?? "#3A1141");
	}
}
