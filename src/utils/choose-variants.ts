import { FishType, FishVariant } from "../data/fish-types";
import { pickRandom, randomInt, shuffle } from "./random";

export type VariantChoice = [FishVariant, number];

export type VariantChoices = VariantChoice[];

export const chooseVariants = (fishTypes: FishType[]) => {
	const variantChoices: VariantChoices[] = [];
	for (const type of fishTypes) {
		const variants = shuffle(type.variants).slice(0, 3);

		let fishVariantChoices: VariantChoice[] = [];
		do {
			fishVariantChoices = variants.reduce(
				(acc: VariantChoice[], variantOptions): VariantChoice[] => {
					const option = pickRandom(variantOptions);
					const modifier = !!option.eyeColor
						? randomInt(-3, 0)
						: randomInt(0, 3) || randomInt(-2, 0);
					return [...acc, [option, modifier]];
				},
				[]
			);
		} while (
			fishVariantChoices.reduce(
				(sum: number, [, modifier]) => sum + modifier,
				type.basePrice
			) < 1
		);

		variantChoices.push(fishVariantChoices);
	}
	return variantChoices;
};
