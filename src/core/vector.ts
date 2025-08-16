export class Vector {
	x: number;
	y: number;

	static ZERO = new Vector();
	static TOP_LEFT = new Vector();
	static TOP = new Vector(0.5, 0);
	static BOTTOM = new Vector(0.5, 1);
	static BOTTOM_RIGHT = new Vector(1, 1);
	static CENTER = new Vector(0.5, 0.5);
	static DOWN = new Vector(0, 1);

	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}

	add(v: Vector) {
		return new Vector(this.x + v.x, this.y + v.y);
	}

	diff(v: Vector) {
		return new Vector(this.x - v.x, this.y - v.y);
	}

	mulv(v: Vector) {
		return new Vector(this.x * v.x, this.y * v.y);
	}

	mul(s: number) {
		return new Vector(this.x * s, this.y * s);
	}

	rotate(a: number) {
		return new Vector(
			this.x * Math.cos(a) - this.y * Math.sin(a),
			this.x * Math.sin(a) + this.y * Math.cos(a)
		);
	}

	length() {
		return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
	}

	equals(v: Vector) {
		return this.x == v.x && this.y == v.y;
	}

	round() {
		return new Vector(Math.round(this.x), Math.round(this.y));
	}

	floor() {
		return new Vector(Math.floor(this.x), Math.floor(this.y));
	}

	clone() {
		return new Vector(this.x, this.y);
	}
}
