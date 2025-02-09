import type {Config} from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
	content: ['./app/**/*.{js,jsx,ts,tsx}'],
	theme: {
		screens: {
			portrait: {raw: '(orientation: portrait)'},
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
			animation: {
				scaleIn: 'scaleIn 200ms ease',
				scaleOut: 'scaleOut 200ms ease',
				fadeIn: 'fadeIn 200ms ease',
				fadeOut: 'fadeOut 200ms ease',
				enterFromLeft: 'enterFromLeft 250ms ease',
				enterFromRight: 'enterFromRight 250ms ease',
				exitToLeft: 'exitToLeft 250ms ease',
				exitToRight: 'exitToRight 250ms ease',
			},
			keyframes: {
				enterFromRight: {
					from: {opacity: '0', transform: 'translateX(200px)'},
					to: {opacity: '1', transform: 'translateX(0)'},
				},
				enterFromLeft: {
					from: {opacity: '0', transform: 'translateX(-200px)'},
					to: {opacity: '1', transform: 'translateX(0)'},
				},
				exitToRight: {
					from: {opacity: '1', transform: 'translateX(0)'},
					to: {opacity: '0', transform: 'translateX(200px)'},
				},
				exitToLeft: {
					from: {opacity: '1', transform: 'translateX(0)'},
					to: {opacity: '0', transform: 'translateX(-200px)'},
				},
				scaleIn: {
					from: {opacity: '0', transform: 'rotateX(-10deg) scale(0.9)'},
					to: {opacity: '1', transform: 'rotateX(0deg) scale(1)'},
				},
				scaleOut: {
					from: {opacity: '1', transform: 'rotateX(0deg) scale(1)'},
					to: {opacity: '0', transform: 'rotateX(-10deg) scale(0.95)'},
				},
				fadeIn: {
					from: {opacity: '0'},
					to: {opacity: '1'},
				},
				fadeOut: {
					from: {opacity: '1'},
					to: {opacity: '0'},
				},
			},
		},
	},
} satisfies Config;
