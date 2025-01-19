import {type LoaderFunctionArgs, useLoaderData, type MetaArgs} from 'react-router';
import {LessonEntityCard} from '~/components/entities-cards';
import {LessonService} from '~/services/lesson.service.server';
import {type TypeUserSession} from '~/types/user-session.type';
import {getUserSession} from '~/utils/session.server';

export const meta = ({data}: MetaArgs<typeof loader>) => [
	{title: 'Yoga em Movimento - Área Pessoal - Aulas Assistidas'},
	{name: 'description', content: 'Aulas assistidas por cada aluno.'},
	{name: 'robots', content: 'noindex, nofollow'},
	...data!.meta,
];

export const loader = async ({request}: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));
	const userData = userSession.data as TypeUserSession;

	const completedLessons = await new LessonService().getCompletedLessonsByUser(userData);

	const completedLessonsWithActivity = completedLessons.data.map(lesson => ({
		...lesson,
		activity: {
			completed: true,
			saved: lesson.lesson.savedBy[0]?.isSaved ?? false,
			favorited: lesson.lesson.favoritedBy[0]?.isFavorited ?? false,
		},
	}));

	return {
		meta: [{tagName: 'link', rel: 'canonical', href: new URL('/profile/completed-lessons', request.url).toString()}],
		userData,
		completedLessonsWithActivity,
	};
};

export default function CompletedLessons() {
	const {completedLessonsWithActivity, userData} = useLoaderData<typeof loader>();

	if (completedLessonsWithActivity?.length === 0) {
		return (
			<div>
				<h1>Aulas Assistidas</h1>
				<p>{userData.firstName}, você ainda não completou nenhuma aula. Conforme assistir as aulas e marcá-las como completas, a lista de suas aulas assistidas aparecerá aqui.</p>
			</div>
		);
	}

	return (
		<div>
			<h1>Aulas Assistidas</h1>

			<div className='flex gap-4 my-4 flex-wrap'>
				{completedLessonsWithActivity?.map(lesson => (
					<LessonEntityCard key={lesson.id} course={lesson.lesson} to={lesson.link} activity={lesson.activity}/>
				))}
			</div>
		</div>
	);
}
