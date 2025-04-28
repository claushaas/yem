import {
	type LoaderFunctionArgs,
	type MetaArgs,
	useLoaderData,
} from 'react-router';
import { LessonWithoutSuspenseEntityCard } from '~/components/entities-cards';
import { LessonService } from '~/services/lesson.service.server';
import { type TypeUserSession } from '~/types/user-session.type';
import { getUserSession } from '~/utils/session.server';

export const meta = ({ data }: MetaArgs<typeof loader>) => [
	{ title: 'Yoga em Movimento - Área Pessoal - Aulas salvas' },
	{ content: 'Aulas salvadas por cada aluno.', name: 'description' },
	{ content: 'noindex, nofollow', name: 'robots' },
	...data!.meta,
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));
	const userData = userSession.data as TypeUserSession;

	if (!userData.id) {
		return {
			meta: [
				{
					href: new URL('/profile/completed-lessons', request.url).toString(),
					rel: 'canonical',
					tagName: 'link',
				},
			],
			savedLessonsWithActivity: [],
			userData,
		};
	}

	const savedLessons = await new LessonService().getSavedLessonsByUser(
		userData,
	);

	const savedLessonsWithActivity = savedLessons.data.map((lesson) => ({
		...lesson,
		activity: {
			completed: lesson.lesson.completedBy[0]?.isCompleted ?? false,
			favorited: lesson.lesson.favoritedBy[0]?.isFavorited ?? false,
			saved: true,
		},
	}));

	return {
		meta: [
			{
				href: new URL('/profile/completed-lessons', request.url).toString(),
				rel: 'canonical',
				tagName: 'link',
			},
		],
		savedLessonsWithActivity,
		userData,
	};
};

export default function CompletedLessons() {
	const { savedLessonsWithActivity, userData } = useLoaderData<typeof loader>();

	if (savedLessonsWithActivity.length === 0) {
		return (
			<div>
				<h1>Aulas Salvadas</h1>
				<p>
					{userData.firstName}, você ainda não salvou nenhuma aula. Conforme
					assistir as aulas e marcá-las como salvas, a lista de suas aulas
					salvadas aparecerá aqui.
				</p>
			</div>
		);
	}

	return (
		<div>
			<h1>Aulas Salvadas</h1>

			<div className="flex gap-4 my-4 flex-wrap">
				{savedLessonsWithActivity.map((lesson) => (
					<LessonWithoutSuspenseEntityCard
						activity={lesson.activity}
						course={lesson.lesson}
						key={lesson.id}
						to={lesson.link}
					/>
				))}
			</div>
		</div>
	);
}
