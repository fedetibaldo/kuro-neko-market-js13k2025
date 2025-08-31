import { GameObject, GameObjectArgs } from "../core/game-object";
import { CENTER, Vector } from "../core/vector";
import { Digit } from "./digit";

type CurrencySignArgs = GameObjectArgs & {
	color: string;
};

export class CurrencySign extends GameObject {
	// color: string;
	size = Vector(9, 9);

	constructor({ color, ...rest }: CurrencySignArgs) {
		super({ color, ...rest });
		// this.color = color;
	}

	createChildren(): GameObject[] {
		return [
			new Digit({
				value: 1,
				origin: CENTER,
				rotation: Math.PI / 2,
				color: this.color,
			}),
			new Digit({ value: 7, color: this.color }),
		];
	}
}
