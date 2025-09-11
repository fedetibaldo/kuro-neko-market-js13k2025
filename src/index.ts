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
import { Results } from "./objects/results/results";
import {
	LEVEL_SCREEN,
	LEVEL_SELECT_SCREEN,
	RESULTS_SCREEN,
} from "./data/screens";
import { ScreenSystem } from "./systems/screen/screen.system";
import { ScreenTransitionContainer } from "./systems/screen/screen-transition-container";
import { LevelSelect } from "./objects/level-select";
import { diamondPattern } from "./objects/patterns/diamond";
import { wavePattern } from "./objects/patterns/wave";
import { woodPattern } from "./objects/patterns/wood";
import { ParticleSystem } from "./systems/particle/particle.system";

const canvas = document.getElementById("g") as HTMLCanvasElement;
const viewRes = Vector(360, 240);

const game = diContainer.set(Game, new Game({ viewRes }));

diContainer.set(UpdateServer, new UpdateServer());
diContainer.set(RenderServer, new RenderServer());
diContainer.set(DisplayServer, new DisplayServer({ canvas }));
diContainer.set(InputServer, new InputServer());
diContainer.set(InteractableServer, new InteractableServer());
diContainer.set(DriftSystem, new DriftSystem());
diContainer.set(LevelSystem, new LevelSystem());
diContainer.set(
	ScreenSystem,
	new ScreenSystem({
		[LEVEL_SELECT_SCREEN]: LevelSelect,
		[LEVEL_SCREEN]: Level,
		[RESULTS_SCREEN]: Results,
	})
);
diContainer.set(ParticleSystem, new ParticleSystem());

game.root.addChildren([
	woodPattern,
	diamondPattern,
	wavePattern,
	new ScreenTransitionContainer({
		children: [new LevelSelect()],
	}),
	new Pointer(),
]);

// start game
game._play();

playMeow();
