import { defineConfig } from "vite";
import golangPlugin from "../dist/index.js";

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
