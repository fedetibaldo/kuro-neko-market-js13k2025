import { diContainer } from "../../core/di-container";
import { Game, GAME_TICK_EVENT } from "../../core/game";
import { Observable } from "../../core/observable";
import { FishType, fishTypes, VariedFish } from "../../data/fish-types";
import { chooseVariants, ScoringVariants } from "./choose-variants";
import {
	chaosStrategy,
	chooseFish,
	ChooseFishStrategy,
	easyStrategy,
	hardStrategy,
	mediumStrategy,
} from "./choose-fish";
import { scoreFish } from "./score-fish";
import { unique } from "../../core/unique";

export type FishTypeIndex = 0 | 1 | 2;
export type LevelSpawnFrequency = 0 | 1 | 2;
export type LevelDifficulty = 0 | 1 | 2 | 3;

export type LevelAttributes = [
	FishTypeIndex[],
	LevelSpawnFrequency,
	LevelDifficulty
];

export const LEVEL_DURATION = 120;
const PADDING = 5;

export const LEVEL_SPAWN_EVENT = unique();
export const LEVEL_TICK_EVENT = unique();
export const LEVEL_END_EVENT = unique();
export const LEVEL_SCORE_EVENT = unique();

export class LevelSystem extends Observable {
	game: Game;

	// Init args
	fishTypes: FishType[];
	freq: LevelSpawnFrequency;
	difficulty: LevelDifficulty;

	// Computed from init args
	scoringVariants: ScoringVariants[];
	strategy: ChooseFishStrategy;
	tToSpawn: number;

	// State
	spawnedFishes: [VariedFish, number, boolean][] = [];
	hasStarted = false;
	hasEnded = false;
	totT = 0;
	t = 0;

	constructor() {
		super();
		this.game = diContainer.get(Game);
		this.game.on(GAME_TICK_EVENT, (deltaT: number) => this.onGameTick(deltaT));
	}

	init(
		fishTypeIndices: FishTypeIndex[],
		freq: LevelSpawnFrequency,
		difficulty: LevelDifficulty
	) {
		this.fishTypes = fishTypeIndices.map((idx) => fishTypes[idx]!);
		this.freq = freq;
		this.difficulty = difficulty;

		this.scoringVariants = chooseVariants(this.fishTypes);

		this.strategy = (
			[easyStrategy, mediumStrategy, hardStrategy, chaosStrategy] as const
		)[difficulty];

		const spawnAmount = 16 + this.freq * 2;
		this.tToSpawn = (LEVEL_DURATION - PADDING) / spawnAmount;

		this.hasStarted = false;
		this.hasEnded = false;
		this.t = 0;
		this.totT = 0;
		this.spawnedFishes = [];
	}

	spawnFish(fish: VariedFish) {
		const typeIndex = this.fishTypes.findIndex(({ id }) => id == fish.id);
		const scoringVariants = this.scoringVariants[typeIndex]!;
		const score = scoreFish(fish, scoringVariants);
		const length = this.spawnedFishes.push([fish, score, false]);
		this.trigger(LEVEL_SPAWN_EVENT, length - 1);
	}

	start() {
		this.hasStarted = true;
	}

	onGameTick(deltaT: number) {
		if (this.hasEnded) return;

		if (this.totT > LEVEL_DURATION) {
			this.hasEnded = true;
			this.trigger(LEVEL_END_EVENT);
			return;
		}

		this.trigger(LEVEL_TICK_EVENT, LEVEL_DURATION - this.totT);

		if (!this.hasStarted) return;

		this.totT += deltaT / 1000;

		if (this.t <= 0) {
			const fish = chooseFish(
				this.fishTypes,
				this.scoringVariants,
				this.strategy
			);
			this.spawnFish(fish);
			this.t = this.tToSpawn;
		}

		if (this.totT > LEVEL_DURATION - PADDING) return;

		this.t -= deltaT / 1000;
	}

	getFish(fishIndex: number): VariedFish {
		return this.spawnedFishes[fishIndex]![0];
	}

	getScore() {
		return this.spawnedFishes.reduce((sum, [, value, isCorrect]) => {
			return isCorrect ? sum + value : sum;
		}, 0);
	}

	verifyScore(fishIndex: number, userScore: number) {
		const spawnedFish = this.spawnedFishes[fishIndex]!;
		if (spawnedFish[1] == userScore) {
			spawnedFish[2] = true;
			this.trigger(LEVEL_SCORE_EVENT, this.getScore());
			return true;
		}
		return false;
	}
}
