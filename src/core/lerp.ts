import { clamp } from "../utils/clamp";
import { Vector, VectorLike } from "./vector";

export type EasingFunction = (val: number) => number;

export type IncrementalLerp<T> = (val?: number) => T;

export const easeLinear: EasingFunction = (val) => val;

export const easeIn: EasingFunction = (val) => val * val;

export const easeOut: EasingFunction = (val) => 1 - (1 - val) * (1 - val);

export const easeInOut: EasingFunction = (val) =>
	lerp(easeIn(val), easeOut(val), val);

export type LerpStrategy<T> = {
	matches(item: unknown): item is T;
	lerp(from: T, to: T, progress: number): T;
};

const numberLerpStrategy: LerpStrategy<number> = {
	matches: (item) => typeof item == "number",
	lerp: (from, to, progress) => from + (to - from) * progress,
};

const vectorLerpStrategy: LerpStrategy<VectorLike> = {
	matches: (item: object): item is VectorLike => "x" in item && "y" in item,
	lerp: (from, to, progress) =>
		Vector(
			from.x + (to.x - from.x) * progress,
			from.y + (to.y - from.y) * progress
		),
};

const lerpStrategies = [numberLerpStrategy, vectorLerpStrategy];

type LerpValue = (typeof lerpStrategies)[number] extends LerpStrategy<infer T>
	? T
	: never;

export function lerp<T extends LerpValue>(from: T, to: T, progress: number): T {
	for (const strategy of lerpStrategies as LerpStrategy<any>[]) {
		if (strategy.matches(from) && strategy.matches(to)) {
			return strategy.lerp(from, to, progress);
		}
	}
	throw new Error(/* "Lerp value did not match any strategy" */);
}

export function makeFixedTimeIncrementalLerp<T extends LerpValue>(
	from: T,
	to: T,
	duration: number,
	ease: EasingFunction = easeLinear
): IncrementalLerp<T> {
	let progress = 0;
	return (absIncrement: number = 0) => {
		const relIncrement = absIncrement / duration;
		progress = clamp(progress + relIncrement, 0, 1);
		return lerp(from, to, ease(progress));
	};
}
