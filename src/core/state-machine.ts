export type Action<T extends symbol> = T;

export type State<S extends symbol, A extends Action<symbol>> =
	| [
			(
				| {
						[K in A]?: S;
				  }
			),
			symbol[]
	  ]
	| [
			| {
					[K in A]?: S;
			  }
	  ];

export type StateMachineDef<S extends symbol, A extends Action<symbol>> = {
	[key in S]: State<S, A>;
};

export class StateMachine<S extends symbol, A extends Action<symbol>> {
	protected _machine: StateMachineDef<S, A>;
	protected _name: S;
	protected _state: State<S, A>;

	constructor(machine: StateMachineDef<S, A>, state: S) {
		this._machine = machine;
		this.to(state);
	}

	is(name: S) {
		return this._name == name;
	}

	can(action: symbol) {
		return !!this._state[0] && action in this._state[0];
	}

	hasTag(tag: symbol) {
		return !!this._state[1] && this._state[1].includes(tag);
	}

	to(name: S) {
		const state = this._machine[name];
		if (!state) return;
		this._name = name;
		this._state = state;
	}

	act<K extends A>(name: K) {
		const action = this._state[0]![name];
		if (!action) return;
		this.to(action);
	}
}
