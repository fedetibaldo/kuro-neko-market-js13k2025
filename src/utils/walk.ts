export const walk = <T>(obj: T, cb: (obj: T) => T[]) => {
	const next = cb(obj);
	next.map((item) => walk(item, cb));
};
