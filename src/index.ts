import "./index.css";
import { Vector } from "./core/vector";
import { Game } from "./core/game";
import { Input } from "./core/input";
import { GameObject } from "./core/game-object";
import { diContainer } from "./core/di-container";
import { CatPaw } from "./objects/cat-paw";
import { Table } from "./objects/table";
import { Fish } from "./objects/fish/fish";

const game = diContainer.set(
	Game,
	new Game({
		canvas: document.getElementById("game") as HTMLCanvasElement,
		viewRes: new Vector(360, 240),
	})
);

diContainer.set(Input, new Input());

game.root.addChildren([
	new GameObject({
		id: "main",
		children: [
			new Table({
				pos: new Vector(0, game.viewRes.y - 90),
				size: new Vector(game.viewRes.x, 90),
			}),
			new Fish({
				pos: new Vector(20, 155),
				size: new Vector(80, 80),
				origin: Vector.CENTER,
				rotation: (-Math.PI / 4) * 3,
			}),
			new CatPaw(),
		],
	}),
]);

// start game
game.play();
