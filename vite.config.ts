import {vitePlugin as remix} from '@remix-run/dev';
import {defineConfig} from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';
import {remixDevTools} from 'remix-development-tools';

export default defineConfig({
	server: {
		host: true,
		port: Number(process.env.APP_PORT) || 3001,
		watch: {
			ignored: ['!**/node_modules/@newrelic/**'],
		},
	},
	optimizeDeps: {
		exclude: ['newrelic', '@newrelic'],
	},
	plugins: [
		remixDevTools(),
		remix(),
		tsconfigPaths(),
		svgr({
			include: '**/*.svg?react',
		}),
	],
});
