import "./index.css";
import { Game } from "./core/game";
import { diContainer } from "./core/di-container";
import { Level } from "./objects/level";
import { RenderServer } from "./core/render.server";
import { UpdateServer } from "./core/update.server";
import { Vector } from "./core/vector";
import { DisplayServer } from "./core/display.server";
import { InputServer } from "./core/input.server";
import { InteractableServer } from "./systems/interactable/interactable.server";
import { Pointer } from "./objects/pointer";
import { playMeow } from "./utils/play-meow";
import { DriftSystem } from "./systems/drift/drift.system";
import { LevelSystem } from "./systems/level/level.system";
import { ScreenTransition } from "./objects/screen-transition";

const canvas = document.getElementById("game") as HTMLCanvasElement;
const viewRes = Vector(360, 240);

const game = diContainer.set(Game, new Game({ viewRes }));

diContainer.set(UpdateServer, new UpdateServer());
diContainer.set(RenderServer, new RenderServer());
diContainer.set(DisplayServer, new DisplayServer({ canvas }));
diContainer.set(InputServer, new InputServer());
diContainer.set(InteractableServer, new InteractableServer());
diContainer.set(DriftSystem, new DriftSystem());
diContainer.set(LevelSystem, new LevelSystem());

game.root.addChildren([
	new Level({ difficulty: 3 }),
	new ScreenTransition(),
	new Pointer(),
]);

// start game
game.play();

playMeow();
