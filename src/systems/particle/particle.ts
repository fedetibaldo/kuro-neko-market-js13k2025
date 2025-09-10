import { GameObject } from "../../core/game-object";
import { easeOut, makeFixedTimeIncrementalLerp } from "../../core/lerp";
import { CENTER } from "../../core/vector";
import { clamp } from "../../utils/clamp";

export class Particle extends GameObject {
	_progress = 0;
	origin = CENTER;
	progressLerp = makeFixedTimeIncrementalLerp(0, 1, 600, easeOut);
	update(deltaT: number) {
		this._progress = this.progressLerp(deltaT);
		this.opacity = clamp(-this._progress * 8 + 8, 0, 1);
		if (this._progress == 1) {
			this.kill();
		}
	}
}
