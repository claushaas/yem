import {reactRouter} from '@react-router/dev/vite';
import {defineConfig} from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from 'tailwindcss';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
	build: {
		cssMinify: process.env.NODE_ENV === 'production' ? 'lightningcss' : false,
		target: 'esnext',
	},
	server: {
		host: true,
		port: Number(process.env.APP_PORT) || 3001,
	},
	plugins: [
		reactRouter(),
		tsconfigPaths(),
		svgr({
			include: '**/*.svg?react',
		}),
	],
	css: {
		postcss: {
			plugins: [tailwindcss],
		},
	},
});
