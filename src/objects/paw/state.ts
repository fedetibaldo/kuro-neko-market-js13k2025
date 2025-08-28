import { StateMachineDef } from "../../core/state-machine";

type PawStateMachine = StateMachineDef<
	"idling" | "pointing" | "pressing" | "pickingUp" | "carrying" | "dropping",
	"drop" | "point" | "pickup" | "tap" | "press" | "next" | "carry" | "idle"
>;

export const pawStateMachine: PawStateMachine = {
	initialState: "idling",
	states: {
		["idling"]: {
			tags: ["moving"],
			actions: {
				["point"]: { target: "pointing" },
				["pickup"]: { target: "pickingUp" },
				["tap"]: { target: "idling" },
			},
		},
		["pointing"]: {
			tags: ["moving", "pointing"],
			actions: {
				["press"]: { target: "pressing" },
				["idle"]: { target: "idling" },
			},
		},
		["pressing"]: {
			tags: ["pointing"],
			actions: {
				["next"]: { target: "idling" },
			},
		},
		["pickingUp"]: {
			tags: [],
			actions: {
				["carry"]: { target: "carrying" },
			},
		},
		["carrying"]: {
			tags: ["moving"],
			actions: {
				["drop"]: { target: "dropping" },
			},
		},
		["dropping"]: {
			tags: [],
			actions: {
				["next"]: { target: "idling" },
			},
		},
	},
};
