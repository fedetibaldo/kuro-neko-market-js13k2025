import { buildSamples, playSamples } from "../vendor/zzfx";

const duration = 0.3;

const attack = (duration / 16) * 4;
const decay = (duration / 16) * 2;
const sustain = (duration / 16) * 4;
const release = (duration / 16) * 6;

const frequency = 440 + 740;

// prettier-ignore
const voice1 = buildSamples(...[1,2,0,frequency,attack + 0.2,sustain,release,0,,,-0.6,0,0,,,,,,0.4,decay + 0.1,,250])
// prettier-ignore
const voice2 = buildSamples(...[0.05,0,frequency - 4,attack,sustain,release,2,,,-0.6,+8,attack + decay,,,,,,0.5,decay,,2000,2]);

export const playMeow = () => {
	playSamples([voice1]);
	playSamples([voice2]);
};
