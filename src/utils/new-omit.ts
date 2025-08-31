export type NewOmit<T, K extends PropertyKey> = {
	[P in keyof T as Exclude<P, K>]: T[P];
};
