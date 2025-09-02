import { FishType, FishVariant } from "../data/fish-types";
import { pickRandom, randomInt, shuffle } from "./random";

export type FishChosenVariant = [FishVariant, number];

export type FishChosenVariants = FishChosenVariant[];

export const chooseVariants = (fishTypes: FishType[]): FishChosenVariants[] => {
	const chosenVariants: FishChosenVariants[] = [];
	for (const type of fishTypes) {
		const variants = shuffle(type.variants).slice(0, 3);

		let fishChosenVariants: FishChosenVariant[] = [];
		do {
			fishChosenVariants = variants.reduce(
				(acc: FishChosenVariant[], variantOptions): FishChosenVariant[] => {
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
