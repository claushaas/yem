import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from '@remix-run/react';
import React from 'react';
import {type LoaderFunctionArgs, type LinksFunction, json} from '@remix-run/node';
import styles from '~/tailwind.css?url';
import {NavBar} from '~/components/navBar';
import {getUserSession} from './utils/session.server';

export const links: LinksFunction = () => [
	{rel: 'stylesheet', href: styles},
];

export const loader = async ({request}: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));

	if (userSession.has('id')) {
		return json({
			userData: {
				id: userSession.get('id') as string,
				email: userSession.get('email') as string,
				roles: userSession.get('roles') as string[],
				firstName: userSession.get('firstName') as string,
				lastName: userSession.get('lastName') as string,
				phoneNumber: userSession.get('phoneNumber') as string,
			},
		});
	}

	return json({userData: null});
};

export function Layout({children}: {children: React.ReactNode}) {
	return (
		<html lang='pt-BR' className='notranslate' translate='no'>
			<head>
				<meta charSet='utf-8' />
				<meta name='viewport' content='width=device-width,initial-scale=1,viewport-fit=cover' />
				<Meta />
				<Links />
			</head>
			<body className='bg-mauve-2 dark:bg-mauvedark-2 min-h-screen flex flex-col'>
				<NavBar />
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
