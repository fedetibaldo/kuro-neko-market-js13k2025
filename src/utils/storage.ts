const stored = (
	initial: "g" | "s",
	key: string | number,
	value?: any
): typeof initial extends "g" ? string | null : void =>
	localStorage[initial + "etItem"]("knm:" + key, value);

export const getStored = <T>(key: string | number) =>
	JSON.parse(stored("g", key)!) as T;
export const setStored = (key: string | number, value: any) =>
	stored("s", key, JSON.stringify(value));
