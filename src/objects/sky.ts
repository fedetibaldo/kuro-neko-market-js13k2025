import { GameObject } from "../core/game-object";
import { Vector } from "../core/vector";
import { createLinearGradient } from "../utils/create-linear-gradient";
import { rotateAroundOrigin } from "../utils/origin-helper";

export class Sky extends GameObject {
	sunAngle = Math.PI * 2;
	sunVelocity = 0.05;

	update(deltaT: number): void {
		this.sunAngle =
			(this.sunAngle + (this.sunVelocity * deltaT) / 1000) % Math.PI;
	}

	render(ctx: OffscreenCanvasRenderingContext2D): void {
		ctx.fillStyle = createLinearGradient(
			ctx,
			Vector.ZERO,
			new Vector(0, this.size.y),
			[
				[0, "#EA9D50"],
				[1, "#E5B993"],
			]
		);
		ctx.fillRect(0, 0, this.size.x, this.size.y);

		const sunOrigin = this.size.mulv(Vector.BOTTOM);
		const sunPos = new Vector(this.size.x / 2 / 4, this.size.y);
		const { x, y } = rotateAroundOrigin(sunPos, this.sunAngle, sunOrigin);

		ctx.fillStyle = "#F9F3EF";
		ctx.beginPath();
		ctx.arc(
			x,
			y + (this.size.y - y) * 2 * (this.size.y / this.size.x),
			20,
			0,
			Math.PI * 2,
			true
		);
		ctx.fill();
	}
}
