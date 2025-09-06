export const walk = <T>(obj: T, cb: (obj: T) => T[]) => {
	const next = cb(obj);
	for (const item of next) {
		walk(item, cb);
	}
};
