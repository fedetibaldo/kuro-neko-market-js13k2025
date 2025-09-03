import { FishType, FishVariant } from "../../data/fish-types";
import { pickRandom, randomInt, shuffle } from "../../utils/random";

export type ScoringVariant = [FishVariant, number];

export type ScoringVariants = ScoringVariant[];

export const chooseVariants = (fishTypes: FishType[]): ScoringVariants[] => {
	const chosenVariants: ScoringVariants[] = [];
	for (const type of fishTypes) {
		const variants = shuffle(type.variants).slice(0, 3);

		let fishChosenVariants: ScoringVariant[] = [];
		do {
			fishChosenVariants = variants.reduce(
				(acc: ScoringVariant[], variantOptions): ScoringVariant[] => {
					const option = pickRandom(variantOptions);
					const modifier = !!option.eyeColor
						? randomInt(-3, 0)
						: randomInt(0, 3) || randomInt(-2, 0);
					return [...acc, [option, modifier]];
				},
				[]
			);
		} while (
			fishChosenVariants.reduce(
				(sum: number, [, modifier]) => sum + modifier,
				type.basePrice
			) < 1
		);

		chosenVariants.push(fishChosenVariants);
	}
	return chosenVariants;
};
