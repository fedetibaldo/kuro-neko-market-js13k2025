import { diContainer } from "../../core/di-container";
import { Game, GAME_TICK_EVENT } from "../../core/game";
import { GameObject } from "../../core/game-object";
import {
	easeIn,
	easeOut,
	IncrementalLerp,
	makeFixedTimeIncrementalLerp,
} from "../../core/lerp";
import { Observable } from "../../core/observable";
import { StateMachine } from "../../core/state-machine";
import { unique } from "../../core/unique";
import {
	SCREEN_ENTER_ACTION,
	SCREEN_EXIT_ACTION,
	SCREEN_PROGRESSING_TAG,
	SCREEN_READY_ACTION,
	SCREEN_READY_STATE,
	SCREEN_WAIT_ACTION,
	SCREEN_WAITING_TAG,
	screenState,
} from "./screen-state";

export type ScreenInterface = {
	screenReady(): void;
};

const TRANSITION_DURATION = 1000;
const INTERSTITIAL_PERIOD = 200;

export const SCREEN_EXIT_EVENT = unique();
export const SCREEN_ENTER_EVENT = unique();

export class ScreenSystem extends Observable {
	mapping: Record<symbol, { new (): GameObject }>;

	prog = 0;
	waitT = 0;

	progLerp: IncrementalLerp<number>;
	nextScreen: { new (): GameObject } | null = null;

	_state = new StateMachine(screenState, SCREEN_READY_STATE);

	constructor(mapping: Record<symbol, { new (): GameObject }>) {
		super();
		this.mapping = mapping;
		diContainer.get(Game).on(GAME_TICK_EVENT, this.onTick);
	}

	onTick = (deltaT: number) => {
		if (this._state.hasTag(SCREEN_PROGRESSING_TAG)) {
			this.prog = this.progLerp(deltaT);
			if (this.prog == 1) {
				this._state.act(SCREEN_WAIT_ACTION);
			}
			if (this.prog == 2) {
				console.log("ready");
				this._state.act(SCREEN_READY_ACTION);
			}
		} else if (this._state.hasTag(SCREEN_WAITING_TAG)) {
			this.waitT += deltaT;
			if (this.waitT >= INTERSTITIAL_PERIOD) {
				this.waitT = 0;
				this.onWaitEnd();
			}
		}
	};

	onWaitEnd() {
		if (!this._state.can(SCREEN_ENTER_ACTION)) return;
		this._state.act(SCREEN_ENTER_ACTION);

		if (this.nextScreen) {
			this.trigger(SCREEN_ENTER_EVENT, new this.nextScreen());
		}
		this.nextScreen = null;

		this.progLerp = makeFixedTimeIncrementalLerp(
			1,
			2,
			TRANSITION_DURATION,
			easeOut
		);
	}

	to(screen: symbol) {
		if (!this._state.can(SCREEN_EXIT_ACTION)) return;
		this._state.act(SCREEN_EXIT_ACTION);

		this.trigger(SCREEN_EXIT_EVENT);
		this.nextScreen = this.mapping[screen]!;

		this.progLerp = makeFixedTimeIncrementalLerp(
			0,
			1,
			TRANSITION_DURATION,
			easeIn
		);
	}
}
