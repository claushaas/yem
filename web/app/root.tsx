import {
	Links,
	Meta,
	type MetaFunction,
	Outlet,
	Scripts,
	ScrollRestoration,
} from '@remix-run/react';
import React, {useState} from 'react';
import {type LoaderFunctionArgs, type LinksFunction, json} from '@remix-run/node';
import styles from '~/tailwind.css?url';
import {NavBar} from '~/components/navBar';
import {getUserSession} from './utils/session.server';
import {AnimatePresence, motion} from 'framer-motion';
import {useLocation, useOutlet} from 'react-router-dom';

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

function AnimatedOutlet() {
	const [outlet] = useState(useOutlet());
	return outlet;
}

export default function App() {
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
				<AnimatePresence mode='wait' initial={false}>
					<motion.main
						key={useLocation().pathname}
						initial={{opacity: 0}}
						animate={{opacity: 1}}
						exit={{opacity: 0}}
						transition={{duration: 0.3}}
					>
						<AnimatedOutlet />
					</motion.main>
				</AnimatePresence>
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}
