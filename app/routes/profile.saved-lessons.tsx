import {type LoaderFunctionArgs, useLoaderData, type MetaArgs} from 'react-router';
import {LessonEntityCard} from '~/components/entities-cards';
import {LessonActivityService} from '~/services/lesson-activity.service.server';
import {LessonService} from '~/services/lesson.service.server';
import {type TypeUserSession} from '~/types/user-session.type';
import {getUserSession} from '~/utils/session.server';

export const meta = ({data}: MetaArgs<typeof loader>) => [
	{title: 'Yoga em Movimento - Área Pessoal - Aulas salvas'},
	{name: 'description', content: 'Aulas salvadas por cada aluno.'},
	{name: 'robots', content: 'noindex, nofollow'},
	...data!.meta,
];

export const loader = async ({request}: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));
	const userData = userSession.data as TypeUserSession;

	if (!userData.id) {
		return {
			meta: [{tagName: 'link', rel: 'canonical', href: new URL('/profile/completed-lessons', request.url).toString()}],
			userData,
			savedLessonsWithActivity: [],
		};
	}

	const savedLessons = await new LessonService().getSavedLessonsByUser(userData);

	const lessonActivityService = new LessonActivityService();

	const savedLessonsWithActivity = savedLessons.data.map(lesson => ({
		...lesson,
		activity: lessonActivityService.getLessonActivityForUser(lesson.lessonSlug, userData.id),
	}));

	return {
		meta: [{tagName: 'link', rel: 'canonical', href: new URL('/profile/completed-lessons', request.url).toString()}],
		userData,
		savedLessonsWithActivity,
	};
};

export default function CompletedLessons() {
	const {savedLessonsWithActivity, userData} = useLoaderData<typeof loader>();

	if (savedLessonsWithActivity.length === 0) {
		return (
			<div>
				<h1>Aulas Salvadas</h1>
				<p>{userData.firstName}, você ainda não salvou nenhuma aula. Conforme assistir as aulas e marcá-las como salvas, a lista de suas aulas salvadas aparecerá aqui.</p>
			</div>
		);
	}

	return (
		<div>
			<h1>Aulas Salvadas</h1>

			<div className='flex gap-4 my-4 flex-wrap'>
				{savedLessonsWithActivity.map(lesson => (
					<LessonEntityCard key={lesson.id} course={lesson.lesson} to={lesson.link} activity={lesson.activity}/>
				))}
			</div>
		</div>
	);
}
