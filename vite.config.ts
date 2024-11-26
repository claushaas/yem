import {reactRouter} from '@react-router/dev/vite';
import {defineConfig} from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';

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
		reactRouter(),
		tsconfigPaths(),
		svgr({
			include: '**/*.svg?react',
		}),
	],
});
