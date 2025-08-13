type EventMap<D> = D extends string
	? { [E in D]: {} }
	: { [E in Extract<keyof D, string>]: D[E] };

type EventName<M> = M extends any ? keyof M : never;

type ArglessEventName<M> = M extends any
	? keyof M[EventName<M>] extends never
		? EventName<M>
		: never
	: never;

type ArgfulEventName<M> = M extends any
	? keyof M[EventName<M>] extends never
		? never
		: EventName<M>
	: never;

type EventArgs<M, E extends EventName<M>> = M extends any
	? E extends keyof M
		? M[E]
		: never
	: never;

type Sub<M, E extends EventName<M>> = M extends any
	? E extends keyof M
		? keyof EventArgs<M, E> extends never
			? () => void
			: (args: M[E]) => void
		: never
	: never;

export class Observable<D> {
	subs: { [E in EventName<EventMap<D>>]?: (Sub<EventMap<D>, E> | null)[] };

	constructor() {
		this.subs = {};
	}

	on<E extends EventName<EventMap<D>>>(event: E, cb: Sub<EventMap<D>, E>) {
		if (!this.subs[event]) {
			this.subs[event] = [];
		}
		this.subs[event].push(cb);
		return () => {
			const subs = this.subs[event];
			if (!subs) return;
			const index = subs.findIndex((sub) => sub === cb);
			if (index >= 0) {
				// schedule for removal
				subs[index] = null;
			}
		};
	}

	trigger<E extends ArglessEventName<EventMap<D>>>(event: E): void;
	trigger<E extends ArgfulEventName<EventMap<D>>>(
		event: E,
		args: EventArgs<EventMap<D>, E>
	): void;
	trigger<E extends EventName<EventMap<D>>>(
		event: E,
		args?: EventArgs<EventMap<D>, E>
	) {
		const implicitMethodName = `on${event.charAt(0).toUpperCase()}${event.slice(
			1
		)}`;
		if (typeof (this as any)[implicitMethodName] === "function") {
			(this as any)[implicitMethodName](args);
		}
		if (this.subs[event]) {
			this.subs[event].forEach((sub) => sub && sub(args as any));
			// remove unsubscribed watchers
			this.subs[event] = this.subs[event].filter(Boolean);
		}
	}

	destroy() {
		this.subs = {};
	}
}
