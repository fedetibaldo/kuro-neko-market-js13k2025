export class Observable {
	constructor() {
		this.subs = {};
	}
	on(event, cb) {
		if (!this.subs[event]) {
			this.subs[event] = [];
		}
		this.subs[event].push(cb);
		return () => {
			const index = this.subs[event].findIndex((sub) => sub === cb);
			if (index >= 0) {
				// schedule for removal
				this.subs[event][index] = null;
			}
		};
	}
	trigger(event, args) {
		const implicitMethodName = `on${event.charAt(0).toUpperCase()}${event.slice(
			1
		)}`;
		if (typeof this[implicitMethodName] == "function") {
			this[implicitMethodName](args);
		}
		if (this.subs[event]) {
			this.subs[event].forEach((sub) => sub && sub(args));
			// remove unsubscribed watchers
			this.subs[event] = this.subs[event].filter(Boolean);
		}
	}
	destroy() {
		this.trigger("destroy");
		this.subs = [];
	}
}
