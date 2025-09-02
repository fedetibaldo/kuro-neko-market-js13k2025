import { Vector } from "../core/vector";

export function scaleFromOrigin(
	point: Vector,
	scale: number,
	concreteOrigin: Vector
) {
	const D = point.diff(concreteOrigin);
	const S = D.mul(scale);
	return point.add(S.diff(D));
}

export function rotateAroundOrigin(
	point: Vector,
	angle: number,
	concreteOrigin: Vector
) {
	const D = point.diff(concreteOrigin);
	const Dr = D.rotate(angle);
	return concreteOrigin.add(Dr);
}
