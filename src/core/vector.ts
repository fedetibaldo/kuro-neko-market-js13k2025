export type VectorLike = { x: number; y: number };

export const Vector = (x: number = 0, y: number = 0) => {
	return {
		["x"]: x,
		["y"]: y,
		gt(v: VectorLike) {
			return this.x > v.x && this.y > v.y;
		},
		lt(v: VectorLike) {
			return this.x < v.x && this.y < v.y;
		},
		add(v: VectorLike) {
			return Vector(this.x + v.x, this.y + v.y);
		},
		diff(v: VectorLike) {
			return Vector(this.x - v.x, this.y - v.y);
		},
		mulv(v: VectorLike) {
			return Vector(this.x * v.x, this.y * v.y);
		},
		oneOver() {
			return Vector(1 / this.x, 1 / this.y);
		},
		mul(s: number) {
			return Vector(this.x * s, this.y * s);
		},
		rotate(a: number) {
			return Vector(
				this.x * Math.cos(a) - this.y * Math.sin(a),
				this.x * Math.sin(a) + this.y * Math.cos(a)
			);
		},
		length() {
			return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
		},
		equals(v: VectorLike) {
			return this.x == v.x && this.y == v.y;
		},
		round() {
			return Vector(Math.round(this.x), Math.round(this.y));
		},

		floor() {
			return Vector(Math.floor(this.x), Math.floor(this.y));
		},

		clone() {
			return Vector(this.x, this.y);
		},
	};
};

export type Vector = ReturnType<typeof Vector>;

export const ZERO = Vector();
export const TOP_LEFT = Vector();
export const TOP_RIGHT = Vector(1, 0);
export const BOTTOM_LEFT = Vector(0, 1);
export const LEFT = Vector(0, 0.5);
export const TOP = Vector(0.5, 0);
export const BOTTOM = Vector(0.5, 1);
export const BOTTOM_RIGHT = Vector(1, 1);
export const CENTER = Vector(0.5, 0.5);
export const DOWN = Vector(0, 1);
