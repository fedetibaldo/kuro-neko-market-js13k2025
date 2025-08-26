class DiContainer {
	instances = new Map<any, any>();

	set<T>(Class: { new (...args: any[]): T }, instance: T): T {
		this.instances.set(Class, instance);
		return instance;
	}

	get<T>(Class: { new (...args: any[]): T }): T {
		const instance = this.instances.get(Class);
		if (!instance)
			throw new Error(/* `Class "${Class.name}" was not provided.` */);
		return instance;
	}
}

export const diContainer = new DiContainer();
