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
	{ title: 'Yoga em Movimento - Área Pessoal - Aulas Favoritadas' },
	{ content: 'Aulas favoritadas de cada aluno.', name: 'description' },
	{ content: 'noindex, nofollow', name: 'robots' },
	...data!.meta,
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));
	const userData = userSession.data as TypeUserSession;

	const favoritedLessons = await new LessonService().getFavoritedLessonsByUser(
		userData,
	);

	const favoritedLessonsWithActivity = favoritedLessons.data.map((lesson) => ({
		...lesson,
		activity: {
			completed: lesson.lesson.completedBy[0]?.isCompleted ?? false,
			favorited: true,
			saved: lesson.lesson.savedBy[0]?.isSaved ?? false,
		},
	}));

	return {
		favoritedLessonsWithActivity,
		meta: [
			{
				href: new URL('/profile/completed-lessons', request.url).toString(),
				rel: 'canonical',
				tagName: 'link',
			},
		],
		userData,
	};
};

export default function FavoritedLessons() {
	const { favoritedLessonsWithActivity, userData } =
		useLoaderData<typeof loader>();

	if (favoritedLessonsWithActivity.length === 0) {
		return (
			<div>
				<h1>Aulas Favoritas</h1>
				<p>
					{userData.firstName}, você ainda não favoritou nenhuma aula. Conforme
					assistir as aulas e marcá-las como favoritas, a lista de suas aulas
					favoritas aparecerá aqui.
				</p>
			</div>
		);
	}

	return (
		<div>
			<h1>Aulas Favoritas</h1>

			<div className="flex gap-4 my-4 flex-wrap">
				{favoritedLessonsWithActivity.map((lesson) => (
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
