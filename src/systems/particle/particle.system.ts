import { diContainer } from "../../core/di-container";
import { Game } from "../../core/game";
import { Vector } from "../../core/vector";
import { range } from "../../utils/range";
import { Particle } from "./particle";

export class ParticleSystem {
	game = diContainer.get(Game);

	_spawn(point: Vector, particle: Particle) {
		particle.pos = point.diff(particle.size.mulv(particle.origin).mul(1 / 2));
		this.game.root.addChild(particle);
	}

	spawn(point: Vector, ParticleClass: { new (): Particle }) {
		this._spawn(point, new ParticleClass());
	}

	spawnRadial(point: Vector, ParticleClass: { new (): Particle }, amount = 8) {
		range(amount).map((idx) => {
			const particle = new ParticleClass();
			particle.rotation = ((Math.PI * 2) / amount) * idx;
			this._spawn(point, particle);
		});
	}
}
