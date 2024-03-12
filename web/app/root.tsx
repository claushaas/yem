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
				<header className={`
					max-xs:max-w-[95%]
					max-w-[90%]
					mx-auto
					my-4
					flex
					justify-between
					items-center
				`}>
					<div className='w-40'>
						<Link to={'/'}>
							<div className='
							inline
							max-xs:before:bg-[url("./assets/logo/logo-reduzido-colorido.svg")]
							xs:before:bg-[url("./assets/logo/logo-retangular-colorido.svg")]
							before:h-10
							before:block
							before:bg-no-repeat
						'/>
						</Link>
					</div>
					<div>
						<p>texto</p>
					</div>
				</header>
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
