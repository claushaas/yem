import {
	Link,
	type LoaderFunctionArgs,
	type MetaArgs,
	Outlet,
	replace,
	useLoaderData,
	useLocation,
} from 'react-router';
import { NavigateBar } from '~/components/navigation-bar.js';
import { type TypeUserSession } from '~/types/user-session.type';
import { getUserSession } from '~/utils/session.server';

export const meta = ({ data }: MetaArgs<typeof loader>) => [
	{ title: 'Yoga em Movimento - Área Administrativa' },
	{
		content:
			'Área para executar as funções administrativas e pedagógicas do Yoga em Movimento.',
		name: 'description',
	},
	{ content: 'noindex, nofollow', name: 'robots' },
	...(data! as LoaderData).meta,
];

type LoaderData = {
	meta: Array<{ tagName: string; rel: string; href: string }>;
	userData: TypeUserSession;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));
	const userData = userSession.data as TypeUserSession;

	if (!userData.roles?.includes('admin')) {
		return replace('/');
	}

	return {
		meta: [
			{
				href: new URL('/admin', request.url).toString(),
				rel: 'canonical',
				tagName: 'link',
			},
		],
		userData,
	};
};

export default function Admin() {
	const { userData } = useLoaderData<typeof loader>() as {
		meta: Array<{ tagName: string; rel: string; href: string }>;
		userData: TypeUserSession;
	};
	const { pathname } = useLocation();

	return (
		userData?.roles?.includes('admin') && (
			<>
				<NavigateBar userData={userData} />

				<div className="flex max-w-[95%] w-full mx-auto flex-col sm:flex-row gap-4">
					<aside className="w-64 p-3 bg-mauve-3 dark:bg-mauvedark-3 shadow-xs shadow-mauve-11 dark:shadow-mauvedark-3 rounded-lg h-fit flex flex-col gap-3">
						<Link to="/admin/students">
							<p>Alunos</p>
						</Link>
						<Link to="/admin/comments">
							<p>Comentários</p>
						</Link>
						<Link to="/admin/courses">
							<p>Cursos</p>
						</Link>
						<Link to="/admin/lessons-without-tags">
							<p>Aulas sem Tags</p>
						</Link>
						<Link to="/admin/tags">
							<p>Tags</p>
						</Link>
						<Link to="/admin/repopulate-cache">
							<p>Repopular cache</p>
						</Link>
					</aside>
					<main className="grow shrink p-3">
						{(pathname === '/admin' || pathname === '/admin/') && (
							<p>Selecione a opção no menu ao lado</p>
						)}
						<Outlet />
					</main>
				</div>
			</>
		)
	);
}
