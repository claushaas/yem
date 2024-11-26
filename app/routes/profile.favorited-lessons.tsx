import {type LoaderFunctionArgs, useLoaderData, type MetaArgs} from 'react-router';
import {LessonEntityCard} from '~/components/entities-cards';
import {LessonActivityService} from '~/services/lesson-activity.service.server';
import {LessonService} from '~/services/lesson.service.server';
import {type TypeUserSession} from '~/types/user-session.type';
import {getUserSession} from '~/utils/session.server';

export const meta = ({data}: MetaArgs<typeof loader>) => [
	{title: 'Yoga em Movimento - Área Pessoal - Aulas Favoritadas'},
	{name: 'description', content: 'Aulas favoritadas de cada aluno.'},
	{name: 'robots', content: 'noindex, nofollow'},
	...data!.meta,
];

export const loader = async ({request}: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));
	const userData = userSession.data as TypeUserSession;

	const favoritedLessons = await new LessonService().getFavoritedLessonsByUser(userData);

	const favoritedLessonsWithActivity = favoritedLessons.data.map(lesson => ({
		...lesson,
		activity: new LessonActivityService().getLessonActivityForUser(lesson.lessonSlug, userData.id),
	}));

	return {
		meta: [{tagName: 'link', rel: 'canonical', href: new URL('/profile/completed-lessons', request.url).toString()}],
		userData,
		favoritedLessonsWithActivity,
	};
};

export default function FavoritedLessons() {
	const {favoritedLessonsWithActivity, userData} = useLoaderData<typeof loader>();

	if (favoritedLessonsWithActivity.length === 0) {
		return (
			<div>
				<h1>Aulas Favoritas</h1>
				<p>{userData.firstName}, você ainda não favoritou nenhuma aula. Conforme assistir as aulas e marcá-las como favoritas, a lista de suas aulas favoritas aparecerá aqui.</p>
			</div>
		);
	}

	return (
		<div>
			<h1>Aulas Favoritas</h1>

			<div className='flex gap-4 my-4 flex-wrap'>
				{favoritedLessonsWithActivity.map(lesson => (
					<LessonEntityCard key={lesson.id} course={lesson.lesson} to={lesson.link} activity={lesson.activity}/>
				))}
			</div>
		</div>
	);
}
