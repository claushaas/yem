import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useFetchers,
	useLoaderData,
	useNavigation,
} from '@remix-run/react';
import {type LoaderFunctionArgs, type LinksFunction, json} from '@remix-run/node';
import NProgress from 'nprogress';
import nProgressStyles from 'nprogress/nprogress.css?url';
import {useEffect, useMemo} from 'react';
import {getUserSession} from './utils/session.server.js';
import {type TypeUserSession} from './types/user-session.type.js';
import {useIsBot} from './hooks/use-is-bot.hook.js';
import styles from '~/tailwind.css?url';
import {NavigateBar} from '~/components/navigation-bar.js';
import {Footer} from '~/components/footer.js';

export const links: LinksFunction = () => [
	{rel: 'stylesheet', href: styles},
	{rel: 'stylesheet', href: nProgressStyles},
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

function App() {
	const data = useLoaderData() as {userData: TypeUserSession | undefined} ?? {};
	const userData = data?.userData;

	const transition = useNavigation();
	const fetchers = useFetchers();

	const state = useMemo<'idle' | 'loading'>(
		() => {
			const states = [
				transition.state,
				...fetchers.map(fetcher => fetcher.state),
			];
			if (states.every(state => state === 'idle')) {
				return 'idle';
			}

			return 'loading';
		},
		[transition.state, fetchers],
	);

	useEffect(() => {
		if (state === 'loading') {
			NProgress.start();
		}

		if (state === 'idle') {
			NProgress.done();
		}
	}, [state]);

	const isBot = useIsBot();

	return (
		<html lang='pt-BR' className='notranslate font-gothamBook' translate='no'>
			<head>
				<meta charSet='utf-8'/>
				<meta httpEquiv='X-UA-Compatible' content='IE=edge'/>
				<meta name='viewport' content='width=device-width,initial-scale=1,minimum-scale=1'/>
				<link rel='apple-touch-icon' sizes='180x180' href='/apple-touch-icon.png'/>
				<link rel='icon' type='image/png' sizes='32x32' href='/favicon-32x32.png'/>
				<link rel='icon' type='image/png' sizes='16x16' href='/favicon-16x16.png'/>
				<link rel='manifest' href='/site.webmanifest'/>
				<Meta/>
				<Links/>
			</head>
			<body className='bg-mauve-2 dark:bg-mauvedark-2 min-h-screen flex flex-col justify-between'>
				<NavigateBar userData={userData}/>
				<Outlet context={{userData}}/>
				<Footer/>
				<ScrollRestoration/>
				{isBot ? null : <Scripts/>}
			</body>
		</html>
	);
}

export default App;
