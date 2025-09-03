import { StateMachineDef } from "../../core/state-machine";
import { unique } from "../../core/unique";

export const PAW_IDLING_STATE = unique();
export const PAW_POINTING_STATE = unique();
export const PAW_PRESSING_STATE = unique();
export const PAW_PICKING_UP_STATE = unique();
export const PAW_CARRYING_STATE = unique();
export const PAW_DROPPING_STATE = unique();

export const PAW_DROP_ACTION = unique();
export const PAW_POINT_ACTION = unique();
export const PAW_PICKUP_ACTION = unique();
export const PAW_TAP_ACTION = unique();
export const PAW_PRESS_ACTION = unique();
export const PAW_NEXT_ACTION = unique();
export const PAW_CARRY_ACTION = unique();
export const PAW_IDLE_ACTION = unique();

export const PAW_MOVING_TAG = unique();
export const PAW_POINTING_TAG = unique();

type PawStateMachine = StateMachineDef<
	| typeof PAW_IDLING_STATE
	| typeof PAW_POINTING_STATE
	| typeof PAW_PRESSING_STATE
	| typeof PAW_PICKING_UP_STATE
	| typeof PAW_CARRYING_STATE
	| typeof PAW_DROPPING_STATE,
	| typeof PAW_DROP_ACTION
	| typeof PAW_POINT_ACTION
	| typeof PAW_PICKUP_ACTION
	| typeof PAW_TAP_ACTION
	| typeof PAW_PRESS_ACTION
	| typeof PAW_NEXT_ACTION
	| typeof PAW_CARRY_ACTION
	| typeof PAW_IDLE_ACTION
>;

export const pawStateMachine: PawStateMachine = {
	initialState: PAW_IDLING_STATE,
	states: {
		[PAW_IDLING_STATE]: {
			tags: [PAW_MOVING_TAG],
			actions: {
				[PAW_POINT_ACTION]: { target: PAW_POINTING_STATE },
				[PAW_PICKUP_ACTION]: { target: PAW_PICKING_UP_STATE },
				[PAW_TAP_ACTION]: { target: PAW_IDLING_STATE },
			},
		},
		[PAW_POINTING_STATE]: {
			tags: [PAW_MOVING_TAG, PAW_POINTING_TAG],
			actions: {
				[PAW_PRESS_ACTION]: { target: PAW_PRESSING_STATE },
				[PAW_IDLE_ACTION]: { target: PAW_IDLING_STATE },
			},
		},
		[PAW_PRESSING_STATE]: {
			tags: [PAW_POINTING_TAG],
			actions: {
				[PAW_NEXT_ACTION]: { target: PAW_IDLING_STATE },
			},
		},
		[PAW_PICKING_UP_STATE]: {
			tags: [],
			actions: {
				[PAW_CARRY_ACTION]: { target: PAW_CARRYING_STATE },
			},
		},
		[PAW_CARRYING_STATE]: {
			tags: [PAW_MOVING_TAG],
			actions: {
				[PAW_DROP_ACTION]: { target: PAW_DROPPING_STATE },
			},
		},
		[PAW_DROPPING_STATE]: {
			tags: [],
			actions: {
				[PAW_NEXT_ACTION]: { target: PAW_IDLING_STATE },
			},
		},
	},
};
