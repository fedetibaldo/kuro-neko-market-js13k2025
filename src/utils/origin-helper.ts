import { Vector } from "../core/vector";

export const scaleFromOrigin = (
	point: Vector,
	scale: number,
	concreteOrigin: Vector
) => {
	const D = point.diff(concreteOrigin);
	const S = D.mul(scale);
	return point.add(S.diff(D));
};

export const rotateAroundOrigin = (
	point: Vector,
	angle: number,
	concreteOrigin: Vector
) => {
	const D = point.diff(concreteOrigin);
	const Dr = D.rotate(angle);
	return concreteOrigin.add(Dr);
};
