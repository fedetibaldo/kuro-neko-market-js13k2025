export type VectorLike = { x: number; y: number };

export const Vector = (x: number = 0, y: number = 0) => {
	return {
		["x"]: x,
		["y"]: y,
		add(v: VectorLike) {
			return Vector(x + v.x, y + v.y);
		},
		diff(v: VectorLike) {
			return Vector(x - v.x, y - v.y);
		},
		mulv(v: VectorLike) {
			return Vector(x * v.x, y * v.y);
		},
		oneOver() {
			return Vector(1 / x, 1 / y);
		},
		mul(s: number) {
			return Vector(x * s, y * s);
		},
		rotate(a: number) {
			return Vector(
				x * Math.cos(a) - y * Math.sin(a),
				x * Math.sin(a) + y * Math.cos(a)
			);
		},
		length() {
			return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
		},
		equals(v: VectorLike) {
			return x == v.x && y == v.y;
		},
		round() {
			return Vector(Math.round(x), Math.round(y));
		},

		floor() {
			return Vector(Math.floor(x), Math.floor(y));
		},

		clone() {
			return Vector(x, y);
		},
	};
};

export type Vector = ReturnType<typeof Vector>;

export const ZERO = Vector();
export const TOP_LEFT = Vector();
export const TOP = Vector(0.5, 0);
export const BOTTOM = Vector(0.5, 1);
export const BOTTOM_RIGHT = Vector(1, 1);
export const CENTER = Vector(0.5, 0.5);
export const DOWN = Vector(0, 1);
