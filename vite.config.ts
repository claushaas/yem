import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
	build: {
		cssMinify: process.env.NODE_ENV === 'production' ? 'lightningcss' : false,
		target: 'es2022',
	},
	plugins: [
		tailwindcss(),
		reactRouter(),
		tsconfigPaths(),
		svgr({
			include: '**/*.svg?react',
		}),
	],
	server: {
		host: true,
		port: Number(process.env.APP_PORT) || 3001,
	},
});
