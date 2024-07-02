import {expressDevServer} from 'remix-express-dev-server';
import {vitePlugin as remix} from '@remix-run/dev';
import {defineConfig} from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';
import {remixDevTools} from 'remix-development-tools';
import {installGlobals} from '@remix-run/node';

installGlobals({nativeFetch: true});

export default defineConfig({
	build: {
		cssMinify: process.env.NODE_ENV === 'production' ? 'lightningcss' : false,
		target: 'esnext',
	},
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
		expressDevServer(),
		remixDevTools(),
		remix({
			future: {
				v3_relativeSplatPath: true, // eslint-disable-line @typescript-eslint/naming-convention
				unstable_singleFetch: true, // eslint-disable-line @typescript-eslint/naming-convention
			},
		}),
		tsconfigPaths(),
		svgr({
			include: '**/*.svg?react',
		}),
	],
});
