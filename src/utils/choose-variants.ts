import { FishType } from "../data/fish-types";

export type VariantChoice = [number, number, number] | [-1, number];

export type VariantChoices = VariantChoice[][];

export const chooseVariants = (fishTypes: FishType[]) => {
	const variantChoices: VariantChoices = [];
	for (const type of fishTypes) {
		const variantIndices = new Set<number>();

		if (Math.random() < 0.3) {
			variantIndices.add(-1); // eye variant
		}

		const randomInt = (minIncl: number, maxExcl: number) => {
			return Math.floor(Math.random() * (maxExcl - minIncl)) + minIncl;
		};

		while (variantIndices.size < 3) {
			const random = randomInt(0, type.variants.length);
			variantIndices.add(random);
		}

		const fishVariantChoices = Array.from(variantIndices).reduce(
			(acc: VariantChoice[], val: number): VariantChoice[] => {
				if (val == -1) {
					return [...acc, [val, randomInt(-3, 0)]];
				}
				const variantOptions = type.variants[val]!;
				return [
					...acc,
					[
						val,
						randomInt(0, variantOptions.length),
						randomInt(0, 3) || randomInt(-2, 0),
					],
				];
			},
			[]
		);

		variantChoices.push(fishVariantChoices);
	}
	return variantChoices;
};
