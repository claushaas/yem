import {
	type LoaderFunctionArgs, Link, Outlet, useLocation, type MetaArgs, useLoaderData,
} from 'react-router';
import {NavigateBar} from '~/components/navigation-bar.js';
import {type TypeUserSession} from '~/types/user-session.type';
import {getUserSession} from '~/utils/session.server';

export const meta = ({data}: MetaArgs<typeof loader>) => [
	{title: 'Yoga em Movimento - Área Pessoal'},
	{name: 'description', content: 'Área pessoal de cada aluno dentro do site da Yoga em Movimento.'},
	{name: 'robots', content: 'noindex, nofollow'},
	...data!.meta,
];

export const loader = async ({request}: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));
	const userData = userSession.data as TypeUserSession;

	return {
		meta: [{tagName: 'link', rel: 'canonical', href: new URL('/profile', request.url).toString()}],
		userData,
	};
};

export default function Profile() {
	const {userData} = useLoaderData<typeof loader>();
	const {pathname} = useLocation();

	return userData?.id && (
		<>
			<NavigateBar userData={userData}/>

			<div className='flex max-w-[95%] w-full mx-auto flex-col sm:flex-row gap-4'>
				<aside className='w-64 p-3 bg-mauve-3 dark:bg-mauvedark-3 shadow-xs shadow-mauve-11 dark:shadow-mauvedark-3 rounded-lg h-fit flex flex-col gap-3'>
					<Link to='/profile/personal-profile'>
						<p>Perfil Pessoal</p>
					</Link>
					<Link to='/profile/completed-lessons'>
						<p>Aulas Assistidas</p>
					</Link>
					<Link to='/profile/saved-lessons'>
						<p>Aulas Salvadas</p>
					</Link>
					<Link to='/profile/favorited-lessons'>
						<p>Aulas Favoritadas</p>
					</Link>
				</aside>
				<main className='grow shrink p-3'>
					{(pathname === '/profile' || pathname === '/profile/') && (
						<p>Selecione a opção no menu ao lado</p>
					)}
					<Outlet/>
				</main>
			</div>
		</>
	);
}
