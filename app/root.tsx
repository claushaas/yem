import {type ReactNode} from 'react';
import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from '@remix-run/react';
import {type LoaderFunctionArgs, type LinksFunction, json} from '@remix-run/node';
import styles from '~/tailwind.css?url';
import {NavBar} from '~/components/navBar';
import {getUserSession} from './utils/session.server';
import {Footer} from '~/components/footer';

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

export const Layout = ({children}: {children: ReactNode}) => (
	<html lang='pt-BR' className='notranslate' translate='no'>
		<head>
			<meta charSet='utf-8' />
			<meta httpEquiv='X-UA-Compatible' content='IE=edge'/>
			<meta name='viewport' content='width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no'/>
			<meta name='layoutmode' content='fitscreen/standard'/>
			<meta name='imagemode' content='force'/>
			<link rel='apple-touch-icon' sizes='180x180' href='/apple-touch-icon.png'/>
			<link rel='icon' type='image/png' sizes='32x32' href='/favicon-32x32.png'/>
			<link rel='icon' type='image/png' sizes='16x16' href='/favicon-16x16.png'/>
			<link rel='manifest' href='/site.webmanifest'/>
			<Meta />
			<Links />
		</head>
		<body className='bg-mauve-2 dark:bg-mauvedark-2 min-h-screen flex flex-col justify-between'>
			<NavBar />
			{children}
			<Footer />
			<ScrollRestoration />
			<Scripts />
		</body>
	</html>
);

const App = () => (
	<Outlet />
);

export default App;
