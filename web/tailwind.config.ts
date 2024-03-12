import type {Config} from 'tailwindcss';
import tailwindcssRadix from 'tailwindcss-radix';
import tailwindcssRadixColors from 'tailwindcss-radix-colors';
import tailwindForms from '@tailwindcss/forms';
import containerQuerys from '@tailwindcss/container-queries';
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
	content: ['./app/**/*.{js,jsx,ts,tsx}'],
	theme: {
		screens: {
			xs: '475px',
			...defaultTheme.screens,
		},
		extend: {
			fontFamily: {
				gothamLight: ['GothamRoundedLight', 'sans-serif'],
				gothamBook: ['GothamRoundedBook', 'sans-serif'],
				gothamMedium: ['GothamRoundedMedium', 'sans-serif'],
				gothamBold: ['GothamRoundedBold', 'sans-serif'],
			},
		},
	},
	plugins: [
		tailwindcssRadix,
		tailwindcssRadixColors,
		tailwindForms,
		containerQuerys,
	],
} satisfies Config;
