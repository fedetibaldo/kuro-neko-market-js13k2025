export const chance = (n: number) => Math.random() < n;

export const randomInt = (minIncl: number, maxExcl: number) => {
	return Math.floor(Math.random() * (maxExcl - minIncl)) + minIncl;
};

export const pickRandom = <T>(arr: T[]) => {
	return arr[randomInt(0, arr.length)] as T;
};

/* https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array/12646864#12646864 */
export const shuffle = <T>(array: T[]): T[] => {
	const copy = [...array];
	for (let i = copy.length - 1; i > 0; i--) {
		const j = randomInt(0, i + 1);
		const temp = copy[i]!;
		copy[i] = copy[j]!;
		copy[j] = temp;
	}
	return copy;
};
