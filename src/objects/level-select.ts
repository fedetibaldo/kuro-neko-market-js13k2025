import { diContainer } from "../core/di-container";
import { Game } from "../core/game";
import { GameObject } from "../core/game-object";
import { InputServer } from "../core/input.server";
import { fishTypes } from "../data/fish-types";
import { LEVEL_SCREEN } from "../data/screens";
import { LevelSystem } from "../systems/level/level.system";
import { ScreenSystem } from "../systems/screen/screen.system";

export class LevelSelect extends GameObject {
	update(): void {
		if (diContainer.get(InputServer).isMouseDown) {
			diContainer.get(LevelSystem).init(fishTypes.slice(0, 3), 2, 2);
			diContainer.get(ScreenSystem).to(LEVEL_SCREEN);
		}
	}

	render(ctx: OffscreenCanvasRenderingContext2D) {
		const game = diContainer.get(Game);
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, game.root.size.x, game.root.size.y);
	}
}
