import "./index.css";

import { zzfx, setVolume, initAudioContext } from "./vendor/zzfx";
import { Vector } from "./core/vector";
import { drawSvg } from "./core/draw-svg";
import { createLinearGradient } from "./utils/create-linear-gradient";

initAudioContext();

class Sound {
	static buttonClick() {
		// prettier-ignore
		zzfx(1, 0, 10, .04, 0, .09, 0, 1, 0, 0, 100, .06, 0, 0, 0, 0, 0, 1, 0) // Blip 377
	}
	static buttonLocked() {
		// prettier-ignore
		zzfx(1, 0, 20, .04, 0, .09, 1, 10, 0, 0, -50, .06, 0, 0, 0, 0, 0, 1, 0); // Blip 377
	}
	static wrongCombination() {
		Sound.buttonLocked();
	}
	static tileSelect(index) {
		// prettier-ignore
		zzfx(1, 0, 20, .04, 0, .09, 0, 1, 0, 0, 50 * (index + 1), .06, 0, 0, 0, 0, 0, 1, 0) // Blip 377
	}
	static score() {
		// prettier-ignore
		zzfx(1, 0, 400, .04, 0, .09, 0, 1, 0, 100, 0, 0, 0, 0, 0, 0, 0, 1, 0); // Blip 377
	}
	static coming() {
		setVolume(0.1);
		Sound.buttonClick();
		setVolume(0.3);
	}
}

const logins = +localStorage.getItem("logins") || 0;
localStorage.setItem("logins", logins + 1);

class Color {
	constructor(r = 0, g = 0, b = 0, a = 255) {
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
	}
	equals(c) {
		return this.r == c.r && this.g == c.g && this.b == c.b && this.a == c.a;
	}
	shift(to, amount) {
		const args = [
			[this.r, to.r],
			[this.g, to.g],
			[this.b, to.b],
			[this.a, to.a],
		].map(([now, target]) => {
			const dir = Math.sign(target - now);
			const fun = dir > 0 ? Math.min : Math.max;
			return fun(now + amount * dir, target);
		});
		return new Color(...args);
	}
	toString() {
		return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a / 255})`;
	}
}

class Observable {
	constructor() {
		this.subs = {};
	}
	on(event, cb) {
		if (!this.subs[event]) {
			this.subs[event] = [];
		}
		this.subs[event].push(cb);
		return () => {
			const index = this.subs[event].findIndex((sub) => sub === cb);
			if (index >= 0) {
				// schedule for removal
				this.subs[event][index] = null;
			}
		};
	}
	trigger(event, args) {
		const implicitMethodName = `on${event.charAt(0).toUpperCase()}${event.slice(
			1
		)}`;
		if (typeof this[implicitMethodName] == "function") {
			this[implicitMethodName](args);
		}
		if (this.subs[event]) {
			this.subs[event].forEach((sub) => sub && sub(args));
			// remove unsubscribed watchers
			this.subs[event] = this.subs[event].filter(Boolean);
		}
	}
	destroy() {
		this.subs = [];
	}
}

class GameObject extends Observable {
	constructor({
		pos = new Vector(),
		opacity = 1,
		scale = 1,
		size = new Vector(),
		origin = Vector.TOP_LEFT,
		rotation = 0,
		freezed = false,
		children = [],
		...unknownOptions
	} = {}) {
		super();

		this.pos = pos;
		this.opacity = opacity;
		this.scale = scale;
		this.rotation = rotation;
		this.origin = origin;
		this.size = size;
		this.freezed = freezed;
		this.children = [];

		for (let key in unknownOptions) {
			this[key] = unknownOptions[key];
		}

		this.addChildren(children || []);
		this.addChildren(this.createChildren());
	}
	destroy() {
		super.destroy();
		if (this.parent) {
			this.parent.removeChild(this);
		}
		const children = this.children;
		this.children = [];
		children.forEach((child) => child.destroy());
	}
	createChildren() {
		return [];
	}
	addChildren(children) {
		children.forEach((child) => this.addChild(child));
	}
	addChild(child, index = this.children.length) {
		child.parent = this;
		this.children[index] = child;
		child.trigger("mount");
		this.trigger("childrenChange");
	}
	getChild(id) {
		if (id === this.id) {
			return this;
		} else {
			for (let i = 0; i < this.children.length; i++) {
				let needle = this.children[i].getChild(id);
				if (needle) {
					return needle;
				}
			}
		}
	}
	get(prop) {
		if (typeof this[prop] == "function") {
			return this[prop]();
		} else {
			return this[prop];
		}
	}
	removeChild(toRemove) {
		const index = this.children.findIndex((child) => child === toRemove);
		this.children.splice(index, 1);
		this.trigger("childrenChange");
	}
	update(deltaT) {
		this.children.forEach((child) => child.update(deltaT));
	}
	/**
	 * @param {CanvasRenderingContext2D} ctx
	 */
	render(ctx) {
		this.children.forEach(
			/**
			 * @param {GameObject} child
			 */
			(child) => {
				ctx.save();
				const pos = child.pos;
				ctx.translate(pos.x, pos.y);

				const A = child.size;
				const S = child.size.mul(child.scale);
				const scaleDiff = A.diff(S).mulv(child.origin);
				ctx.translate(scaleDiff.x, scaleDiff.y);

				ctx.scale(child.scale, child.scale);

				const O = child.size.mulv(child.origin);
				const D = Vector.ZERO.diff(O);
				const Dr = D.rotate(child.rotation);
				const Oi = O.add(Dr);
				ctx.translate(Oi.x, Oi.y);

				ctx.rotate(child.rotation);

				ctx.globalAlpha = child.opacity * this.getGlobalOpacity();
				// ctx.strokeStyle = "red";
				// child.size && ctx.strokeRect(0, 0, child.size.x, child.size.y);
				child.render(ctx);
				ctx.restore();
			}
		);
	}
	isFreezed() {
		const freezed = this.freezed;
		if (this.parent && !freezed) {
			return this.parent.isFreezed();
		}
		return freezed;
	}
	getGlobalOpacity() {
		if (this.parent) {
			return this.opacity * this.parent.getGlobalOpacity();
		} else {
			return this.opacity;
		}
	}
	getGlobalPosition() {
		if (this.parent) {
			return this.pos.add(this.parent.getGlobalPosition());
		} else {
			return this.pos;
		}
	}
}

class Canvas extends GameObject {
	constructor({ size = new Vector(), debug = false, ...rest }) {
		super(rest);
		this.size = size;
		this.canvas = new OffscreenCanvas(this.size.x, this.size.y);
		this.debug = debug;
		this.ctx = this.canvas.getContext("2d");
		// this.ctx.imageSmoothingEnabled = false;
	}
	/**
	 * @param {CanvasRenderingContext2D} ctx
	 */
	render(ctx) {
		this.children.forEach((child) => {
			child.render(this.ctx);
		});
		if (this.debug) {
			ctx.drawImage(this.canvas, 0, 0);
		}
	}
	getGlobalOpacity() {
		return this.opacity;
	}
	getGlobalPosition() {
		return this.pos;
	}
}

class GameSingleton extends Observable {
	constructor({
		canvas = document.createElement("canvas"),
		viewRes = new Vector(),
	}) {
		super();
		this.canvas = canvas;
		this.ctx = this.canvas.getContext("2d");

		this.viewRes = viewRes;

		this.subCanvas = document.createElement("canvas");
		this.subCanvas.width = this.viewRes.x;
		this.subCanvas.height = this.viewRes.y;
		this.subCtx = this.subCanvas.getContext("2d");

		this.subCtx.imageSmoothingEnabled = false;

		this.root = new GameObject({});
		this.oldT = 0;

		window.onresize = () => this.fitScreen();
		this.fitScreen();
	}
	fitScreen() {
		const computedStyle = window.getComputedStyle(this.canvas);
		this.canvasSize = new Vector(
			parseInt(computedStyle.width),
			parseInt(computedStyle.height)
		);
		this.canvas.width = this.canvasSize.x;
		this.canvas.height = this.canvasSize.y;

		this.ctx.imageSmoothingEnabled = false;

		const upscaleFactor = Math.min(
			this.canvasSize.x / this.viewRes.x,
			this.canvasSize.y / this.viewRes.y
		);

		this.viewSize = new Vector(
			this.viewRes.x * upscaleFactor,
			this.viewRes.y * upscaleFactor
		);

		this.viewPos = this.canvasSize.diff(this.viewSize).mul(1 / 2);
	}
	loop(newT) {
		window.requestAnimationFrame((newT) => this.loop(newT));
		if (this.root) {
			if (this.oldT) {
				const deltaT = newT - this.oldT;
				this.trigger("tick", deltaT);

				this.subCtx.fillStyle = createLinearGradient(
					this.subCtx,
					Vector.BOTTOM.mulv(this.viewRes),
					Vector.TOP.mulv(this.viewRes),
					[
						[0.5, "#B9F5FF"],
						[1, "#898FFA"],
					]
				);
				this.subCtx.fillRect(0, 0, this.viewRes.x, this.viewRes.y);

				this.root.update(deltaT);
				this.root.render(this.subCtx);

				this.ctx.drawImage(
					this.subCanvas,
					0,
					0,
					this.viewRes.x,
					this.viewRes.y,
					this.viewPos.x,
					this.viewPos.y,
					this.viewSize.x,
					this.viewSize.y
				);
			}
			this.oldT = newT;
		}
	}
	play() {
		this.loop();
	}
}

const Game = new GameSingleton({
	canvas: document.getElementById("game"),
	viewRes: new Vector(360, 240),
});

class InputSingleton extends Observable {
	constructor() {
		super();

		this.isMouseDown = false;
		this.isTouchDevice = false;
		this.isScrolling = false;
		this.mousePos = new Vector(0, 0);
		this.scrollVelocity = 5;
		this.sensitivity = 2;

		this.lastDragPoint = null;

		Game.canvas.onmousedown = (e) => this.onCanvasMouseDown(e);
		Game.canvas.onmouseup = (e) => this.onCanvasMouseUp(e);
		Game.canvas.onmousemove = (e) => this.onCanvasMouseMove(e);

		Game.canvas.ontouchstart = (e) => this.onCanvasTouchStart(e);
		Game.canvas.ontouchend = (e) => this.onCanvasTouchEnd(e);
		Game.canvas.ontouchmove = (e) => this.onCanvasTouchMove(e);

		Game.canvas.onwheel = (e) => this.onCanvasWheel(e);
	}
	onCanvasTouchStart(e) {
		e = this._normalizeTouchEvent(e);
		this.onCanvasMouseDown(e);
	}
	onCanvasTouchEnd(e) {
		e = this._normalizeTouchEvent(e);
		this.onCanvasMouseUp(e);
	}
	onCanvasTouchMove(e) {
		e = this._normalizeTouchEvent(e);
		this.onCanvasMouseMove(e);
	}
	_normalizeTouchEvent(e) {
		this.isTouchDevice = true;
		e.clientX = e.changedTouches[0].clientX;
		e.clientY = e.changedTouches[0].clientY;
		e.isTouchEvent = true;
		return e;
	}
	onCanvasMouseDown(e) {
		if (document.pointerLockElement !== Game.canvas) {
			Game.canvas.requestPointerLock();
		}
		this.isMouseDown = true;
		this.lastDragPoint = this.initialDragPoint = this.normalizePosition(
			this.eventToVector(e)
		);
		this.stopMomentum && this.stopMomentum();
		this.triggerMouseEvent("mousedown", e);
	}
	onCanvasMouseUp(e) {
		this.isMouseDown = false;
		this.triggerMouseEvent("mouseup", e);
		if (this.isScrolling) {
			this.stopMomentum = Game.on("tick", (deltaT) => {
				const delta = (this.lastDelta = this.lastDelta.diff(
					this.lastDelta.mul(this.scrollVelocity * (deltaT / 1000))
				));
				this.triggerEvent("scroll", { delta });
				if (delta.length() < 0.1) {
					this.stopMomentum();
				}
			});
		}
		this.isScrolling = false;
	}
	onCanvasMouseMove(e) {
		this.triggerMouseEvent("mousemove", e);
		if (this.isMouseDown) {
			const newDragPoint = this.normalizePosition(this.eventToVector(e));
			if (!this.isScrolling) {
				const deltaFromStart = newDragPoint.diff(this.initialDragPoint);
				if (deltaFromStart.length() > this.sensitivity) {
					this.isScrolling = true;
				}
			}
			if (this.isScrolling) {
				const delta = newDragPoint.diff(this.lastDragPoint);
				this.lastDelta = delta;
				this.lastDragPoint = newDragPoint;
				this.triggerEvent("scroll", { delta });
			}
		}
	}
	onCanvasWheel(e) {
		const delta = (
			e.shiftKey ? new Vector(e.deltaY, 0) : new Vector(0, e.deltaY)
		)
			.mul(this.scrollVelocity)
			.mul(-1);
		// const delta = dir.mul(this.scrollVelocity)
		this.triggerEvent("scroll", { delta });
	}
	triggerMouseEvent(name, e) {
		if (!e.isTouchEvent && this.isTouchDevice) {
			return;
		}
		const pos = this.normalizePosition(this.eventToVector(e));
		this.mousePos = pos;
		this.triggerEvent(name, { pos });
	}
	triggerEvent(name, args) {
		this.trigger(name, { name, ...args });
	}
	eventToVector(e) {
		return new Vector(e.clientX, e.clientY);
	}
	normalizePosition(pos) {
		const clickPos = pos.diff(Game.viewPos);
		clickPos.x = (clickPos.x * Game.viewRes.x) / Game.viewSize.x;
		clickPos.y = (clickPos.y * Game.viewRes.y) / Game.viewSize.y;
		return clickPos;
	}
}

const Input = new InputSingleton();

class Timer extends Observable {
	constructor(duration = 0) {
		super();
		this.duration = duration;
		this.progress = 0;
		this.unsubscribe = Game.on("tick", (deltaT) => this.onGameTick(deltaT));
	}
	onGameTick(deltaT) {
		this.progress += deltaT;
		this.trigger("tick", Math.min(this.progress / this.duration, 1));
		if (this.progress > this.duration) {
			this.trigger("completed");
			this.unsubscribe();
			this.destroy();
		}
	}
}

class Interval extends Observable {
	constructor(interval) {
		super();
		this.interval = interval;
		this.stopped = false;
		this.onTimerCompleted();
	}
	onTimerCompleted() {
		if (!this.stopped) {
			this.trigger("tick");
			this.timer = new Timer(this.interval);
			this.timer.on("completed", () => this.onTimerCompleted());
		} else {
			this.destroy();
		}
	}
	stop() {
		this.stopped = true;
	}
}

class GameAnimation extends Observable {
	constructor({ duration, delay = 0 }) {
		super();
		this.promise = new Promise((resolve) => {
			const delayTimer = new Timer(delay);
			delayTimer.on("completed", () => {
				this.trigger("start");
				const animationTimer = new Timer(duration);
				animationTimer.on("tick", (progress) =>
					this.trigger("progress", progress)
				);
				animationTimer.on("completed", () => {
					this.trigger("end");
					resolve();
					this.destroy();
				});
			});
		});
	}
}

class Animate {
	static jumpOut(gameObject, { duration, delay }) {
		const animation = new GameAnimation({ duration, delay });
		let base = 0;
		animation.on("start", () => (base = gameObject.pos.y));
		animation.on("progress", (progress) => {
			// y = -8 + (8x - sqrt8)^2
			gameObject.pos.y = base + (-8 + Math.pow(8 * progress - Math.sqrt(8), 2));
			gameObject.opacity = 1 - progress;
		});
		return animation;
	}
	static jumpIn(gameObject, { duration, delay }) {
		const animation = new GameAnimation({ duration, delay });
		gameObject.opacity = 0;
		let base = 0;
		animation.on("start", () => (base = gameObject.pos.y));
		animation.on("progress", (progress) => {
			gameObject.pos.y = base - 6 * (1 - progress);
			gameObject.opacity = progress;
		});
		return animation;
	}
	static shake(gameObject, { duration, delay }) {
		const animation = new GameAnimation({ duration, delay });
		let base = 0;
		animation.on("start", () => (base = gameObject.pos.x));
		animation.on("progress", (progress) => {
			gameObject.pos.x = base + 1 * Math.sin(2 * Math.PI * progress);
		});
		return animation;
	}
	static explode(gameObject, { duration, delay }) {
		const animation = new GameAnimation({ duration, delay });
		const { scale, pos, size } = gameObject;
		animation.on("progress", (progress) => {
			const scaleFactor = 1.25;
			gameObject.pos = pos.diff(size.mul((progress * scaleFactor) / 2));
			gameObject.scale = scale + progress * scaleFactor;
			gameObject.opacity = 1 - progress;
		});
		return animation;
	}
	static fadeTo(gameObject, { duration, delay, to }) {
		const animation = new GameAnimation({ duration, delay });
		const { opacity: from } = gameObject;
		animation.on("progress", (progress) => {
			const opacity = from + (to - from) * progress;
			gameObject.opacity = opacity;
		});
		return animation;
	}
	static fadeIn(gameObject, options) {
		return Animate.fadeTo(gameObject, { ...options, to: 1 });
	}
	static fadeOut(gameObject, options) {
		return Animate.fadeTo(gameObject, { ...options, to: 0 });
	}
	static blink(gameObject, { duration, delay }) {
		const animation = new GameAnimation({ duration, delay });
		const startOpacity = gameObject.opacity;
		const oppositeOpacity = gameObject.opacity >= 0.5 ? 0 : 1;
		animation.on("progress", (progress) => {
			if (progress >= 0 && progress < 0.5) {
				gameObject.opacity = oppositeOpacity;
			} else if (progress >= 0.5 && progress < 1) {
				gameObject.opacity = startOpacity;
			}
			if (progress == 1) {
				gameObject.opacity = oppositeOpacity;
			}
		});
		return animation;
	}
	static zoomTo(gameObject, { duration, delay, to }) {
		const animation = new GameAnimation({ duration, delay });
		const { pos, size, scale: from } = gameObject;
		const ogPos = pos.add(
			size
				.mul(from)
				.diff(size)
				.mul(1 / 2)
		);
		animation.on("progress", (progress) => {
			const scale = from + (to - from) * progress;
			// gameObject.pos = pos.add(pos.diff(size.mul(scale).mul(1/2)))
			gameObject.pos = ogPos.diff(
				size
					.mul(scale)
					.diff(size)
					.mul(1 / 2)
			);
			gameObject.scale = scale;
		});
		return animation;
	}
	static zoomIn(gameObject, options) {
		gameObject.scale = 0;
		return Animate.zoomTo(gameObject, { ...options, to: 1 });
	}
	static zoomOut(gameObject, options) {
		gameObject.scale = 1;
		return Animate.zoomTo(gameObject, { ...options, to: 0 });
	}
	static slide(gameObject, { duration, delay, to }) {
		const animation = new GameAnimation({ duration, delay });
		let { pos } = gameObject;
		pos = new Vector(pos.x, pos.y);
		animation.on("progress", (progress) => {
			gameObject.pos = pos.add(to.diff(pos).mul(progress));
		});
		return animation;
	}
	static lift(gameObject, { duration, delay }) {
		const animation = new GameAnimation({ duration, delay });
		let { pos } = gameObject;
		const to = new Vector(pos.x, pos.y + -4);
		animation.on("progress", (progress) => {
			gameObject.opacity = 1 - progress;
			gameObject.pos = pos.add(to.diff(pos).mul(progress));
		});
		return animation;
	}
	static counter(gameObject, { duration, delay, to }) {
		const animation = new GameAnimation({ duration, delay });
		gameObject.text = "0";
		animation.on("progress", (progress) => {
			gameObject.text = `${Math.round(to * progress)}`;
		});
		return animation;
	}
}

class Area extends GameObject {
	constructor({ size = new Vector(), ...options }) {
		super({ size, ...options });

		this.isInside = false;
		this.isPressed = false;

		// event listeners
		this.listeners = [
			Input.on("mouseup", (e) => this.onMouseEvent("mouseup", e)),
			Input.on("mousedown", (e) => this.onMouseEvent("mousedown", e)),
			Input.on("mousemove", (e) => this.onMouseEvent("mousemove", e)),
		];
	}
	destroy() {
		super.destroy();
		this.listeners.forEach((sub) => sub());
		this.listeners = [];
	}
	onMouseEvent(name, event) {
		if (!this.isFreezed() && this.isPointWithinObject(event.pos)) {
			if (!this.isInside) {
				this.trigger("mouseenter", event);
				this.isInside = true;
			}
			if (name == "mousedown") {
				this.isPressed = true;
			}
			this.trigger(name, event);
			if (name == "mouseup" && this.isPressed) {
				if (!Input.isScrolling) {
					this.trigger("click", event);
				}
				this.isPressed = false;
			}
		} else {
			if (this.isInside) {
				this.trigger("mouseexit", event);
				this.isPressed = false;
			}
			this.isInside = false;
		}
	}
	isPointWithinObject(point) {
		const gPos = this.getGlobalPosition();
		const { x, y } = gPos;
		const { x: w, y: h } = gPos.add(this.size);
		return point.x > x && point.x < w && point.y > y && point.y < h;
	}
}

class Modal extends GameObject {
	constructor({
		text = ``,
		pos = Game.viewRes.mul(1 / 2),
		size = Game.viewRes,
		...options
	}) {
		super({ text, size, pos, ...options });
	}
	onMount() {
		Animate.zoomIn(this, { duration: 200 });
	}
	createChildren() {
		const padding = new Vector(8, 8);
		const flexSize = this.size.diff(padding.mul(2));
		return [
			new Flexbox({
				pos: padding,
				size: flexSize,
				direction: "column",
				align: "end",
				justify: "start",
				spaceBetween: 12,
				children: [
					new Button({
						text: "X",
						fillStyle: Color.grey, //new Color(),
						strokeStyle: Color.lightGrey,
						padding: (17 - 2 - 6) / 2,
						size: new Vector(17, 18),
						onClick: () => this.close(),
					}),
					new GameText({
						size: flexSize,
						text: this.text,
						lineHeight: 2,
					}),
				],
			}),
		];
	}
	close() {
		Animate.zoomOut(this, { duration: 200 }).on("end", () => {
			this.trigger("close");
			this.destroy();
		});
	}
	render(ctx) {
		ctx.strokeStyle = Color.lightGrey.toString();
		ctx.fillStyle = Color.darkGrey.toString();
		ctx.fillRect(0, 0, this.size.x, this.size.y);
		ctx.strokeRect(0.5, 0.5, this.size.x - 1, this.size.y - 1);
		super.render(ctx);
	}
}

class Flexbox extends GameObject {
	constructor({
		direction = "row",
		spaceBetween = 0,
		align = "center",
		justify = "center",
		...options
	}) {
		super({ direction, spaceBetween, align, justify, ...options });
	}
	onChildrenChange() {
		const mainAxis = this.direction == "row" ? "x" : "y";
		const secondaryAxis = this.direction == "row" ? "y" : "x";

		const direction = new Vector();
		direction[mainAxis] = 1;

		const childrenCumulativeSize = this.children.reduce(
			(size, child) => size.add(child.size),
			new Vector()
		);
		const spaceBetweenVector = direction.mul(this.spaceBetween);
		const childrenTotalSize = childrenCumulativeSize.add(
			spaceBetweenVector.mul(this.children.length - 1)
		);

		const offset = new Vector();

		/* The main axis offset is global and increments child after child */

		// justify == 'start' -> offset[mainAxis] = 0 (already is)
		if (this.justify == "center") {
			offset[mainAxis] = this.size
				.mul(1 / 2)
				.diff(childrenTotalSize.mul(1 / 2))[mainAxis];
		} else if (this.justify == "end") {
			offset[mainAxis] = this.size.diff(childrenTotalSize)[mainAxis];
		}

		this.children.forEach((child) => {
			/* The secondary axis offset is local and child-dependent */

			// align == 'start' -> offset[secondaryAxis] = 0 (already is)
			if (this.align == "center") {
				offset[secondaryAxis] = this.size
					.mul(1 / 2)
					.diff(child.size.mul(1 / 2))[secondaryAxis];
			} else if (this.align == "end") {
				offset[secondaryAxis] = this.size.diff(child.size)[secondaryAxis];
			}

			child.pos = offset.floor();
			offset[mainAxis] += child.size[mainAxis] + spaceBetweenVector[mainAxis];
		});
	}
}

class FishEye extends GameObject {
	/**
	 * @param {CanvasRenderingContext2D} ctx
	 */
	render(ctx) {
		ctx.beginPath();
		ctx.arc(4, 4, 4, 0, Math.PI * 2, false);
		ctx.closePath();
		ctx.fillStyle = "black";
		ctx.fill();
		ctx.lineWidth = 2;
		ctx.strokeStyle = "white";
		ctx.stroke();
	}
}

class Fish extends GameObject {
	createChildren() {
		this.texture = new Canvas({
			size: new Vector(16, 16),
			children: [
				new RoundedScales({
					id: "texture",
				}),
			],
		});
		return [this.texture, new FishEye({ pos: new Vector(37, 7) })];
	}
	update(delta) {
		// if (typeof this.ogScale == "undefined") {
		// 	this.ogScale = this.scale;
		// }
		// this.scale = this.ogScale - 0.5 * Math.abs(Math.sin(Game.oldT / 1000));
		// this.rotation += delta / 1000;
	}
	/**
	 * @param {CanvasRenderingContext2D} ctx
	 */
	render(ctx) {
		drawSvg(ctx, {
			path: "M40.5 64.5 38.1.3C22-1.5 15.5 32 35.5 62L32 77.5l1.8 1.9L38 74l9.2 2.9-6.7-12.4Z",
		});
		ctx.fillStyle = "#00000044";
		ctx.fill();
		drawSvg(ctx, {
			path: "m33.8 79.4 5.3-15 3 .6 5 11.9-6.5-5-6.9 7.5Z",
		});
		ctx.fillStyle = "#4e7dac";
		ctx.fill();
		drawSvg(ctx, {
			path: "M39 64.4c-9.3-21.6-10.6-58.8-.9-64 15 13.7 14.7 48 4 64.6l-3-.6Z",
		});
		const gradient = ctx.createLinearGradient(0, 0, this.size.x, 0);
		gradient.addColorStop(0.25, "#FFFFFF");
		gradient.addColorStop(0.75, "#4a86f5");
		ctx.fillStyle = gradient;
		ctx.fill();
		const pattern = ctx.createPattern(this.texture.canvas, "repeat");
		ctx.fillStyle = pattern;
		ctx.fill();
		drawSvg(ctx, {
			path: "m39 64.4 1.2.2m2 .4-1-.2m-1-.2-1.5 7m1.5-7 1 .2m0 0 1.3 5.8",
		});
		ctx.lineCap = "round";
		ctx.stroke();
		// ctx.lineWidth = 4;
		// ctx.lineCap = "round";
		// ctx.lineJoin = "bevel";
		// ctx.strokeStyle = "white";
		// ctx.stroke();
		super.render(ctx);
	}
}

class RoundedScales extends GameObject {
	constructor(args) {
		super(args);
		this.size = new Vector(16, 16);
	}
	/**
	 * @param {CanvasRenderingContext2D} ctx
	 */
	render(ctx) {
		// ctx.fillStyle = "red";
		// ctx.fillRect(0, 0, this.size.x, this.size.y);
		ctx.strokeStyle = "black";
		ctx.lineWidth = 1;
		drawSvg(ctx, {
			path: "M16 12c-3 0-4-4-4-4s-1 4-4 4-4-4-4-4-1 4-4 4M0 0s1 4 4 4 4-4 4-4 1 4 4 4 4-4 4-4",
		});
		ctx.stroke();
	}
}

class Table extends GameObject {
	createChildren() {
		return [
			new Canvas({
				id: "texture",
				size: new Vector(60, 60),
				children: [new Wood()],
			}),
		];
	}
	/**
	 * @param {CanvasRenderingContext2D} ctx
	 */
	render(ctx) {
		const pattern = ctx.createPattern(
			this.getChild("texture").canvas,
			"repeat"
		);
		ctx.fillStyle = pattern;
		ctx.fillRect(0, 0, this.size.x, this.size.y);
		super.render(ctx);
	}
}

class Wood extends GameObject {
	shadeDarkViewBox = new Vector(9, 13);
	shadeLightViewBox = new Vector(14, 11);
	shadeDarkPath = "M0 13c3.9 0 9-3 9-6.5C9 2.9 3.9 0 0 0v13Z";
	shadeLightPath = "M0 11c7.7 0 14-2.5 14-5.5S7.7 0 0 0v11Z";
	/**
	 * @param {CanvasRenderingContext2D} ctx
	 */
	shadeDarkGradient = (ctx, flipH = false) => {
		const gradient = ctx.createLinearGradient(0, 0, this.shadeDarkViewBox.x, 0);
		gradient.addColorStop(flipH ? 1 : 0, "#A3683C");
		gradient.addColorStop(flipH ? 0 : 1, "#975C3A");
		return gradient;
	};
	/**
	 * @param {CanvasRenderingContext2D} ctx
	 */
	shadeLightGradient = (ctx, flipH = false) => {
		const gradient = ctx.createLinearGradient(
			0,
			0,
			this.shadeLightViewBox.x,
			0
		);
		gradient.addColorStop(flipH ? 1 : 0, "#A3683C");
		gradient.addColorStop(flipH ? 0 : 1, "#AD774B");
		return gradient;
	};
	shadeDarkPos = [
		{ pos: new Vector(21, -5), flipH: true },
		{ pos: new Vector(34, 10), flipH: true },
		{ pos: new Vector(10, 20) },
		{ pos: new Vector(23, 36) },
		{ pos: new Vector(7, 43), flipH: true },
		{ pos: new Vector(21, 55), flipH: true },
	];
	shadeLightPos = [
		{ pos: new Vector(1, 0) },
		{ pos: new Vector(17, 10) },
		{ pos: new Vector(45, 22) },
		{ pos: new Vector(-10, 38) },
		{ pos: new Vector(50, 38) },
		{ pos: new Vector(35, 32) },
	];

	constructor(args) {
		super(args);
		this.size = new Vector(60, 60);
	}
	/**
	 * @param {CanvasRenderingContext2D} ctx
	 */
	render(ctx) {
		ctx.fillStyle = "#A3683C";
		ctx.fillRect(0, 0, this.size.x, this.size.y);

		const shades = [
			{
				gradient: this.shadeDarkGradient,
				positions: this.shadeDarkPos,
				viewBox: this.shadeDarkViewBox,
				path: this.shadeDarkPath,
			},
			{
				gradient: this.shadeLightGradient,
				positions: this.shadeLightPos,
				viewBox: this.shadeLightViewBox,
				path: this.shadeLightPath,
			},
		];

		for (const { gradient, positions, viewBox, path } of shades) {
			for (const { pos, flipH } of positions) {
				ctx.save();
				ctx.fillStyle = gradient(ctx, flipH);
				ctx.translate(pos.x, pos.y);
				drawSvg(ctx, { path, viewBox, flipH });
				ctx.fill();
				ctx.restore();
			}
		}

		const linePosY = [10.5, 32.5, 54.5];
		ctx.strokeStyle = "#302523";
		ctx.lineWidth = 2;
		for (const y of linePosY) {
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(this.size.x, y);
			ctx.stroke();
		}

		const veins = [
			{
				gradient: createLinearGradient(
					ctx,
					new Vector(0, 0),
					new Vector(14, 0),
					[
						[0, "#975B37"],
						[1, "#A2663B"],
					]
				),
				path: "M0 17c3 0 5 .5 7.5 0 2.6-.5 4-1.5 6.5-1.5",
			},
			{
				gradient: createLinearGradient(
					ctx,
					new Vector(0, 0),
					new Vector(60, 0),
					[
						[0, "#6C3D29"],
						[1, "#975B37"],
					]
				),
				path: "M0 21c4.5 0 7.3-1.6 12-1.5 3.1 0 4.9 1 8 1 3.5 0 5.5-.9 9-1 4.7-.1 7.3.9 12 1 7.4.2 11.5-3.5 19-3.5",
			},
			{
				gradient: createLinearGradient(
					ctx,
					new Vector(19, 0),
					new Vector(60, 0),
					[
						[0, "#985D3A"],
						[0.5, "#5B3727"],
						[1, "#6C3D29"],
					]
				),
				path: "M60 21c-2 0-7 .6-8.5 1-4 1-15.5 1.7-19 2-6 .5-11 3-15 3",
			},
			{
				gradient: createLinearGradient(
					ctx,
					new Vector(13, 0),
					new Vector(48, 0),
					[
						[0, "#975B37"],
						[0.5, "#76452A"],
						[1, "#A3683C"],
					]
				),
				path: "M13 47.5c4.5-.5 7-2 11.5-3 5.2-1 8.3-1 13.5-2 4-.8 6-2 10-2.5",
			},
			{
				gradient: createLinearGradient(
					ctx,
					new Vector(0, 0),
					new Vector(16, 0),
					[
						[0, "#6C3D29"],
						[1, "#975B37"],
					]
				),
				path: "M0 47c6.5 0 10.5-3 16.5-4",
			},
			{
				gradient: createLinearGradient(
					ctx,
					new Vector(36, 0),
					new Vector(60, 0),
					[
						[0, "#975C3A"],
						[1, "#6C3D29"],
					]
				),
				path: "M37.5 48c9-1 19-1 22.5-1",
			},
		];

		for (const { gradient, path } of veins) {
			ctx.strokeStyle = gradient;
			ctx.lineWidth = 2;
			drawSvg(ctx, { path });
			ctx.stroke();
		}
	}
}

(async function () {
	Game.root.addChildren([
		new GameObject({
			id: "main",
			children: [
				new Table({
					pos: new Vector(0, Game.viewRes.y - 90),
					size: new Vector(Game.viewRes.x, 90),
				}),
				new Fish({
					pos: new Vector(20, 155),
					size: new Vector(80, 80),
					origin: Vector.CENTER,
					rotation: (-Math.PI / 4) * 3,
				}),
			],
		}),
	]);

	// start game
	Game.play();
})();
