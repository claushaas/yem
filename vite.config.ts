import {vitePlugin as remix} from '@remix-run/dev';
import {defineConfig} from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
	server: {
		watch: {
			ignored: ['!**/node_modules/@newrelic/**'],
		},
	},
	optimizeDeps: {
		exclude: ['newrelic', '@newrelic'],
	},
	plugins: [
		remix(),
		tsconfigPaths(),
		svgr({
			include: '**/*.svg?react',
		}),
	],
});
