import { VariedFish } from "../../data/fish-types";
import { ScoringVariant } from "./choose-variants";

export const scoreFish = (fish: VariedFish, variants: ScoringVariant[]) => {
	return variants.reduce((sum: number, [variant, amount]) => {
		for (const key in variant) {
			const value = variant[key as keyof VariedFish];
			if (value != fish[key as keyof VariedFish]) {
				return sum;
			}
		}
		return sum + amount;
	}, fish.basePrice);
};
