import { defineConfig } from "vite";
import golangPlugin from "vite-plugin-use-golang";

export default defineConfig({
	plugins: [
		golangPlugin({
			optimization: "z",
			generateTypes: true,
		}),
	],
	server: {
		fs: {
			allow: [".."],
		},
	},
});
