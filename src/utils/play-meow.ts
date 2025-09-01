import { ZZFXSound } from "../vendor/zzfx";

export const playMeow = () => {
	const duration = 0.3;

	const attack = (duration / 16) * 4;
	const decay = (duration / 16) * 2;
	const sustain = (duration / 16) * 4;
	const release = (duration / 16) * 6;

	const frequency = 440 + 740;

	const voice1 = new ZZFXSound([
		2,
		0,
		frequency,
		attack + 0.2,
		sustain,
		release,
		0,
		undefined,
		undefined, //-1.2,
		-0.6,
		0,
		0,
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		0.4,
		decay + 0.1,
		undefined,
		250,
		0,
	]); // Sound Default

	const voice2 = new ZZFXSound([
		0.05,
		0,
		frequency - 4,
		attack,
		sustain,
		release,
		2,
		undefined,
		undefined, //-1.2,
		-0.6,
		+8,
		attack + decay,
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		0.5,
		decay,
		undefined,
		2000,
		2,
	]); // Sound Default

	voice1.play(1, 1);
	voice2.play(1, 1);
};
