import { Vector } from "../core/vector";

type BaseFishData = {
	id: string;
	basePrice: 5 | 6 | 7;
	size: Vector;
	pattern: string;
	shadow: string;
	tail: string;
	tailPath: string;
	body: string;
	bodyFill1: string;
	bodyFill2: string;
	tailFill1: string;
	tailFill2: string;
	details: string;
	eyes: [number, Vector][];
	eyeColor: string;
};

export type FishVariant = Partial<BaseFishData>;

export type FishType = BaseFishData & {
	variants: FishVariant[][];
};

export type VariedFish = BaseFishData;

export const fishTypes: FishType[] = [
	{
		id: "mackerel",
		variants: [
			[{ eyeColor: "#C7B3CA" }],
			[{ bodyFill1: "#A45EB1" }, { bodyFill1: "#323033" }],
			[
				{ tailFill1: "#A45EB1", tailFill2: "#A45EB1" },
				{ tailFill1: "#323033", tailFill2: "#323033" },
			],
			[{ pattern: "m0 4 12 12 4-4M0 12 12 0l4 4" }],
		],
		basePrice: 5,
		size: Vector(40, 70),
		pattern:
			"M16 12c-3 0-4-4-4-4s-1 4-4 4-4-4-4-4-1 4-4 4M0 0s1 4 4 4 4-4 4-4 1 4 4 4 4-4 4-4",
		shadow: "M23 65 20 0C4-1-2 32 18 62l-4 16 2 1 4-5 9 3-6-12Z",
		tailFill1: "#429247",
		tailFill2: "#429247",
		bodyFill1: "#A3D9A7",
		bodyFill2: "#429247",
		tail: "m16 79 5-15 3 1 5 12-6-5-7 7Z",
		tailPath:
			"m3 9 15 6-7-7 5-7L4 6M3 9l-2 1m2-1 1-1m0-2L1 5m3 1v1m0 1 7 2M4 8V7m0 0 6-1",
		body: "M21 64C12 43 10 6 20 0c15 14 15 48 4 65l-3-1Z",
		details: "m21 64 1 1m2 0h-1m-1 0-1 7m1-7h1m0 0 2 6",
		eyes: [[8, Vector(19, 7)]],
		eyeColor: "#3A1141",
	},
	{
		id: "sole",
		variants: [
			[{ eyeColor: "#C7B3CA" }],
			[{ bodyFill1: "#F399EA" }, { bodyFill1: "#968F9D" }],
			[{ tailFill2: "#F399EA" }, { tailFill2: "#5B5661" }],
			[
				{ pattern: "M0 5c3 0 5-4 8-4s5 4 8 4M0 13c3 0 5-4 8-4s5 4 8 4" },
				{
					pattern: "m0 8 6 6m10-6-6 6M5 8l3 3 3-3M2 6l6-6 6 6M3 0 0 3m13-3 3 3",
				},
			],
		],
		basePrice: 6,
		size: Vector(50, 70),
		pattern:
			"M0 5c3 0 5-4 8-4s5 4 8 4M0 13c2 0 2 3 0 3m0-7c3 0 5 4 8 4s5-4 8-4m0 4c-2 0-2 3 0 3M8 8C6 8 6 5 8 5s2 3 0 3Z",
		shadow: "M28 79 25 0c-26 6-36 45-4 64 0 4-11 13 7 15Z",
		tailFill1: "#D7A374",
		tailFill2: "#D7A374",
		bodyFill1: "#D7A374",
		bodyFill2: "#B27242",
		tail: "M21 76c-3-1 6-14 6-14C3 47-6 32 25 1c35 16 21 41 4 61 0 0 8 14 6 15-4 2-9 2-14-1Z",
		tailPath:
			"M1 11h3m0 0c3 2 9 5 11 4s4-12 1-14C14 0 6 5 4 5m0 6V9m0-4H1m3 0v2m0 2 8 1M4 9V7m0 0 10-2",
		body: "M24 57C7 40 4 16 25 0c21 15 21 37 6 58v7h-6s1-6-1-8Z",
		details:
			"M39 43h3m-1-8h3m-2-8h3m-5-7h4m-34 7H8m3 7H7m6 7H9m7 7h-3m13 17h4m-3 0-1 8m3-8 2 10",
		eyes: [
			[6, Vector(24, 6)],
			[4, Vector(27, 2)],
		],
		eyeColor: "#3A1141",
	},
	{
		id: "tile",
		variants: [
			[{ eyeColor: "#C7B3CA" }],
			[{ bodyFill1: "#F399EA" }, { bodyFill1: "#5B5661" }],
			[
				{ tailFill1: "#A45EB1", tailFill2: "#A45EB1" },
				{ tailFill1: "#968F9D", tailFill2: "#968F9D" },
			],
			[
				{
					pattern: "m0 1 4 4 4-4 4 4 4-4M0 9l4 4 4-4 4 4 4-4",
				},
				{
					pattern: "m0 8 6 6m10-6-6 6M5 8l3 3 3-3M2 6l6-6 6 6M3 0 0 3m13-3 3 3",
				},
			],
		],
		basePrice: 7,
		size: Vector(40, 70),
		pattern: "M0 5c3 0 5-4 8-4s5 4 8 4M0 13c3 0 5-4 8-4s5 4 8 4",
		shadow: "M21 79 17 1C3-1-10 25 15 65l-3 13 3 1h6Z",
		tailFill1: "#B44141",
		tailFill2: "#B44141",
		bodyFill1: "#EEAA67",
		bodyFill2: "#B44141",
		tail: "m15 79 2-10 4 3 3-2 5 9H15Z",
		tailPath:
			"m5 7 10-5v14L5 14m0-7L1 8m4-1 1 1m1 2-1 2m1-2h6m-6 0L6 8m-1 6-4-1m4 1 1-2m0 0 5 1M6 8l6-2",
		body: "M28 12c5 10 1 34-5 52l1 6-3 2-4-3 1-7c-4-6-8-27-8-29 0-11 0-29 7-32 6 2 9 6 11 11Z",
		details: "m17 69 2 1m5 0-2 1m-1 1-2-2m2 2v5m0-5 1-1m-3-1-1 5m4-4 3 6",
		eyes: [[4, Vector(22, 7)]],
		eyeColor: "#3A1141",
	},
];
