import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
	files: 'out/test/**/*.test.js',
	workspaceFolder: './src/test/env/testing.code-workspace',
	coverage: {
		reporter: ["lcov", "json-summary"],
		exclude: [
			"./src/test/util/**/*",
		]
	},
	launchArgs: ["--disable-extensions"],
});
