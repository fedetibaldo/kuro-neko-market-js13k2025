export class Vector {
	x: number;
	y: number;

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

	mul(s: number) {
		return new Vector(this.x * s, this.y * s);
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
