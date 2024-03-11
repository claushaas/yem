import type {Config} from 'tailwindcss';
import tailwindcssRadix from 'tailwindcss-radix';
import tailwindcssRadixColors from 'tailwindcss-radix-colors';

export default {
	content: ['./app/**/*.{js,jsx,ts,tsx}'],
	theme: {
		extend: {
			colors: {
			},
		},
	},
	plugins: [
		tailwindcssRadix,
		tailwindcssRadixColors,
	],
} satisfies Config;
