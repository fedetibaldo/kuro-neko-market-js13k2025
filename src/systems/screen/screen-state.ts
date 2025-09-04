import { StateMachineDef } from "../../core/state-machine";
import { unique } from "../../core/unique";

export const SCREEN_PROGRESSING_TAG = unique();
export const SCREEN_WAITING_TAG = unique();

export const SCREEN_READY_STATE = unique();
export const SCREEN_EXITING_STATE = unique();
export const SCREEN_WAITING_STATE = unique();
export const SCREEN_ENTERING_STATE = unique();

export const SCREEN_READY_ACTION = unique();
export const SCREEN_EXIT_ACTION = unique();
export const SCREEN_WAIT_ACTION = unique();
export const SCREEN_ENTER_ACTION = unique();

type ScreenState = StateMachineDef<
	| typeof SCREEN_READY_STATE
	| typeof SCREEN_EXITING_STATE
	| typeof SCREEN_WAITING_STATE
	| typeof SCREEN_ENTERING_STATE,
	| typeof SCREEN_READY_ACTION
	| typeof SCREEN_EXIT_ACTION
	| typeof SCREEN_WAIT_ACTION
	| typeof SCREEN_ENTER_ACTION
>;

export const screenState: ScreenState = {
	[SCREEN_READY_STATE]: [
		{
			[SCREEN_EXIT_ACTION]: SCREEN_EXITING_STATE,
		},
	],
	[SCREEN_EXITING_STATE]: [
		{
			[SCREEN_WAIT_ACTION]: SCREEN_WAITING_STATE,
		},
		[SCREEN_PROGRESSING_TAG],
	],
	[SCREEN_WAITING_STATE]: [
		{
			[SCREEN_ENTER_ACTION]: SCREEN_ENTERING_STATE,
		},
		[SCREEN_WAITING_TAG],
	],
	[SCREEN_ENTERING_STATE]: [
		{
			[SCREEN_READY_ACTION]: SCREEN_READY_STATE,
		},
		[SCREEN_PROGRESSING_TAG],
	],
};
