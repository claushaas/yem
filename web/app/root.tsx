import {
	Link,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from '@remix-run/react';
import React from 'react';
import {type LinksFunction} from '@remix-run/node';
import Logo from '~/assets/logo/logo-retangular-colorido.svg?react';
import styles from '~/tailwind.css?url';

export const links: LinksFunction = () => [
	{rel: 'stylesheet', href: styles},
];

export function Layout({children}: {children: React.ReactNode}) {
	return (
		<html lang='en'>
			<head>
				<meta charSet='utf-8' />
				<meta name='viewport' content='width=device-width, initial-scale=1' />
				<Meta />
				<Links />
			</head>
			<body className={`
				bg-mauve-2
				dark:bg-mauvedark-2
				min-h-screen
			`}>
				<div>
					<Link to={'/'}>
						<Logo width={150} />
					</Link>
				</div>
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	return <Outlet />;
}

/// <reference types="vite-plugin-svgr/client" />
