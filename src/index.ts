import "./index.css";
import { Vector } from "./core/vector";
import { Game } from "./core/game";
import { Input } from "./core/input";
import { diContainer } from "./core/di-container";
import { Level } from "./objects/level";

const game = diContainer.set(
	Game,
	new Game({
		canvas: document.getElementById("game") as HTMLCanvasElement,
		viewRes: new Vector(360, 240),
	})
);

diContainer.set(Input, new Input());

game.root.addChildren([new Level()]);

// start game
game.play();
