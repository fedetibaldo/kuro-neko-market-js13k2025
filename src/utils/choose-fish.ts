import { FishType, FishVariant } from "../data/fish-types";
import { FishChosenVariants } from "./choose-variants";
import { randomInt, chance, pickRandom, shuffle } from "./random";

type FishChoiceStrategy = (
	fishType: FishType,
	variants: FishVariant[]
) => FishType;

export const easyStrategy: FishChoiceStrategy = (fishType, variants) => {
	if (chance(1 / 3)) return fishType;
	return {
		...fishType,
		...pickRandom(variants),
	};
};

export const mediumStrategy: FishChoiceStrategy = (fishType, variants) => {
	if (chance(1 / 4)) return fishType;
	const shuffledVariants = shuffle(variants);
	const firstVariant = shuffledVariants[0]!;

	let fish = {
		...fishType,
		...firstVariant,
	};

	const secondVariant = shuffledVariants[1]!;
	if (chance(1 / 3)) {
		return fish;
	}

	return {
		...fish,
		...secondVariant,
	};
};

export const hardStrategy: FishChoiceStrategy = (fishType, variants) => {
	const shuffledVariants = shuffle(variants);

	const selectedVariants = shuffledVariants.reduce((variants, variant) => {
		if (chance(1 / 3)) {
			return variants;
		}
		return [...variants, variant];
	}, [] as FishVariant[]);

	return selectedVariants.reduce(
		(fish: FishType, variant) => ({ ...fish, ...variant }),
		fishType
	);
};

export const chaosStrategy: FishChoiceStrategy = (fishType, variants) => {
	const shuffledVariants = shuffle(fishType.variants);

	const randomPick = chance(1 / 2) ? pickRandom(variants) : null;

	const selectedVariants = shuffledVariants.reduce(
		(variants, options) => {
			const variant = pickRandom(options);
			if (chance(1 / 3)) {
				return variants;
			}
			return [...variants, variant];
			// To prevent incompatible variants
		},
		randomPick ? [randomPick] : []
	);

	if (randomPick) {
		// To override possible overrides
		selectedVariants.push(randomPick);
	}

	return selectedVariants.reduce(
		(fish: FishType, variant) => ({ ...fish, ...variant }),
		fishType
	);
};

export const chooseFish = (
	fishTypes: FishType[],
	chosenVariants: FishChosenVariants[],
	strategy: FishChoiceStrategy
) => {
	const idx = randomInt(0, fishTypes.length);
	const chosenFish = fishTypes[idx]!;
	const chosenVariantsForFish = chosenVariants[idx]!.map(
		([variant]) => variant
	);
	return strategy(chosenFish, chosenVariantsForFish);
};
