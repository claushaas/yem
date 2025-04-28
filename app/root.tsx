import NProgress from 'nprogress';
import nProgressStyles from 'nprogress/nprogress.css?url';
import { useEffect, useMemo } from 'react';
import {
	Links,
	type LinksFunction,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useFetchers,
	useNavigation,
} from 'react-router';
import styles from '~/app.css?url';
import { Footer } from '~/components/footer.js';
import { HelpButton } from './components/help-button.js';
import { useIsBot } from './hooks/use-is-bot.hook.js';

export const links: LinksFunction = () => [
	{ href: styles, rel: 'stylesheet' },
	{ href: nProgressStyles, rel: 'stylesheet' },
];

function App() {
	const transition = useNavigation();
	const fetchers = useFetchers();

	const state = useMemo<'idle' | 'loading'>(() => {
		const states = [
			transition.state,
			...fetchers.map((fetcher) => fetcher.state),
		];
		if (states.every((state) => state === 'idle')) {
			return 'idle';
		}

		return 'loading';
	}, [transition.state, fetchers]);

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
		<html className="notranslate font-gothamBook" lang="pt-BR" translate="no">
			<head>
				<meta charSet="utf-8" />
				<meta content="IE=edge" httpEquiv="X-UA-Compatible" />
				<meta
					content="width=device-width,initial-scale=1,minimum-scale=1"
					name="viewport"
				/>
				<link
					href="/apple-touch-icon.png"
					rel="apple-touch-icon"
					sizes="180x180"
				/>
				<link
					href="/favicon-32x32.png"
					rel="icon"
					sizes="32x32"
					type="image/png"
				/>
				<link
					href="/favicon-16x16.png"
					rel="icon"
					sizes="16x16"
					type="image/png"
				/>
				<link href="/site.webmanifest" rel="manifest" />
				<Meta />
				<Links />
			</head>
			<body className="bg-mauve-2 dark:bg-mauvedark-2 min-h-screen flex flex-col justify-between">
				<Outlet />
				<Footer />
				<HelpButton />
				<ScrollRestoration />
				{isBot ? null : <Scripts />}
			</body>
		</html>
	);
}

export default App;
