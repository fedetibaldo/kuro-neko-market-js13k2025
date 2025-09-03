export type Action<T extends symbol /* , U = void */> = T; // { [key in T]: U };

// type ActionMachineInterface<S extends symbol, C extends {}> = {
// 	transition: (state: S) => void;
// 	// setContext: (context: Partial<C>) => void;
// 	// context: C;
// };

export type ActionDef<S extends symbol> = { target: S };

// type ActionCallback<S extends symbol, C extends {}, U = void> = U extends void
// 	? ActionDef<S> | ((machine: ActionMachineInterface<S, C>) => void)
// 	: (machine: ActionMachineInterface<S, C>, args: U) => void;

export type State<
	S extends symbol /* , C extends {} */,
	A extends Action<symbol /* , any */>
> = {
	// enter?: ActionCallback<S, C>;
	tags?: symbol[];
	actions?: {
		[K in /* keyof */ A]?: ActionDef<S>; // ActionCallback<S, C, A[K]>;
	};
};

export type StateMachineDef<
	S extends symbol,
	// C extends {},
	A extends Action<symbol /* , any */>
> = {
	// context: C;
	initialState: S;
	states: {
		[key in S]: State<S /* , C */, A>;
	};
};

// type ActionCallbackOf<
// 	T extends StateMachine<any, any, any>,
// 	K extends T extends StateMachine<any, any, infer A> ? keyof A : never
// > = T extends StateMachine<infer S, infer C, infer A>
// 	? ActionCallback<S, C, A[K]>
// 	: never;

export class StateMachine<
	S extends symbol /* , C extends {} */,
	A extends Action<symbol /* , any */>
> {
	// implements ActionMachineInterface<S, C>
	protected machine: StateMachineDef<S /* , C */, A>;
	protected state: State<S /* , C */, A>;
	// context: C;

	constructor(machine: StateMachineDef<S /* , C */, A>) {
		this.machine = machine;
		// this.context = machine.context;
		this.transition(machine.initialState);
	}

	// setContext(context: Partial<C>) {
	// 	this.context = {
	// 		...this.context,
	// 		...context,
	// 	};
	// }

	can(action: symbol) {
		return !!this.state.actions && action in this.state.actions;
	}

	hasTag(tag: symbol) {
		return !!this.state.tags && this.state.tags.includes(tag);
	}

	transition(name: S) {
		const state = this.machine.states[name];
		if (!state) return;
		this.state = state;
		// this.state.enter?.(this);
	}

	action<K extends /* keyof */ A>(
		name: K /* , ...args: A[K] extends void ? [] : [A[K]] */
	) {
		const action = this.state.actions?.[name];
		if (!action) return;
		// action(this, args);
		this.transition(action.target);
	}
}
