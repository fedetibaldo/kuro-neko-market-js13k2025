import { diContainer } from "../../core/di-container";
import { GameObject, GameObjectArgs } from "../../core/game-object";
import { ScreenTransition } from "./screen-transition";
import {
	SCREEN_EXIT_EVENT,
	SCREEN_ENTER_EVENT,
	ScreenSystem,
} from "./screen.system";

export class ScreenTransitionContainer extends GameObject {
	screen: ScreenSystem;

	constructor(args: GameObjectArgs) {
		super(args);
		this.screen = diContainer.get(ScreenSystem);
		this.screen.on(SCREEN_EXIT_EVENT, this.onExit);
		this.screen.on(SCREEN_ENTER_EVENT, this.onEnter);
		this.addChild(new ScreenTransition());
	}

	onEnter = async (nextScreen: GameObject) => {
		const [child] = this.heirs;
		if (child) {
			child.kill();
		}

		this.addChild(nextScreen, 0);
	};

	onExit = async () => {
		const [child] = this.heirs;
		if (child) {
			child.frozen = true;
		}
	};
}
