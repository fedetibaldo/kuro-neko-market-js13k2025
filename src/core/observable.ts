type Callback = (args?: any) => void;
export type OffFunction = () => void;

export class Observable {
	subs: Record<symbol, (Callback | null)[]>;
	constructor() {
		this.subs = {};
	}
	on(event: symbol, cb: Callback): OffFunction {
		if (!this.subs[event]) {
			this.subs[event] = [];
		}
		this.subs[event].push(cb);
		return () => {
			const index = this.subs[event]!.findIndex((sub) => sub === cb);
			if (index >= 0) {
				// schedule for removal
				this.subs[event]![index] = null;
			}
		};
	}
	trigger(event: symbol, args?: any) {
		if (this.subs[event]) {
			this.subs[event].forEach((sub) => sub && sub(args));
			// remove unsubscribed watchers
			this.subs[event] = this.subs[event].filter(Boolean);
		}
	}
	kill() {
		this.subs = {};
	}
}
