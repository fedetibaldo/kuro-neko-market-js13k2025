import { js13kViteConfig } from "js13k-vite-plugins";
import { defineConfig, UserConfig } from "vite";

export default defineConfig((configEnv) => {
	const config = js13kViteConfig({
		roadrollerOptions: configEnv.mode === "development" ? false : undefined,
	}) as UserConfig;

	return config;
});
