import { diContainer } from "../../core/di-container";
import { Flexbox } from "../../core/flexbox";
import { Game } from "../../core/game";
import { GameObject } from "../../core/game-object";
import { TOP, Vector } from "../../core/vector";
import { LevelSystem } from "../../systems/level/level.system";
import { range } from "../../utils/range";
import { FishGraphic } from "../fish/fish-graphic";

export class Results extends GameObject {
	game: Game;
	level: LevelSystem;

	constructor() {
		super();
		this.level = diContainer.get(LevelSystem);
		this.game = diContainer.get(Game);

		const spawnedFish = this.level.spawnedFishes;
		const fishPerRow = 13;
		const rows = Math.ceil(spawnedFish.length / fishPerRow);
		const monoSpacedSize = Vector(50, 80);
		const rowHeight = monoSpacedSize.y;

		this.addChildren([
			new Flexbox({
				pos: Vector(0, 50),
				size: Vector(this.game.root.size.x, rowHeight * rows),
				direction: "col",
				scale: 0.33,
				origin: TOP,
				children: [
					...range(rows).map((row) => {
						return new Flexbox({
							size: Vector(this.game.root.size.x * 2, rowHeight),
							spaceBetween: 5,
							justify: "start",
							children: spawnedFish
								.slice(fishPerRow * row, fishPerRow * (row + 1))
								.map(([type, value, guessed]) => {
									return new FishGraphic({
										type,
										size: monoSpacedSize,
										rotation: -(Math.PI / 4) * 3,
									});
								}),
						});
					}),
				],
			}),
		]);
	}

	render(ctx: OffscreenCanvasRenderingContext2D) {
		ctx.fillStyle = "#E5A367";
		ctx.fillRect(0, 0, this.game.root.size.x, this.game.root.size.y);
	}
}
