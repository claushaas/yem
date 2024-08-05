import {type LoaderFunctionArgs, unstable_defineLoader as defineLoader, unstable_data as data} from '@remix-run/node';
import {useLoaderData, type MetaArgs_SingleFetch} from '@remix-run/react';
import {LessonEntityCard} from '~/components/entities-cards';
import {LessonActivityService} from '~/services/lesson-activity.service.server';
import {LessonService} from '~/services/lesson.service.server';
import {type TypeUserSession} from '~/types/user-session.type';
import {getUserSession} from '~/utils/session.server';

export const meta = ({data}: MetaArgs_SingleFetch<typeof loader>) => [
	{title: 'Yoga em Movimento - Área Pessoal - Aulas salvas'},
	{name: 'description', content: 'Aulas salvadas por cada aluno.'},
	{name: 'robots', content: 'noindex, nofollow'},
	...data!.meta,
];

export const loader = defineLoader(async ({request}: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));
	const userData = userSession.data as TypeUserSession;

	if (!userData.id) {
		return data({
			meta: [{tagName: 'link', rel: 'canonical', href: new URL('/profile/completed-lessons', request.url).toString()}],
			userData,
			savedLessonsWithActivity: [],
		}, {
			status: 303,
			headers: {
				Location: '/',
			},
		});
	}

	const savedLessons = await new LessonService().getSavedLessonsByUser(userData);

	const savedLessonsWithActivity = savedLessons.data.map(lesson => ({
		...lesson,
		activity: new LessonActivityService().getLessonActivityForUser(lesson.lessonSlug, userData.id),
	}));

	return data({
		meta: [{tagName: 'link', rel: 'canonical', href: new URL('/profile/completed-lessons', request.url).toString()}],
		userData,
		savedLessonsWithActivity,
	});
});

export default function CompletedLessons() {
	const {savedLessonsWithActivity, userData} = useLoaderData<typeof loader>();

	if (savedLessonsWithActivity.length === 0) {
		return (
			<div>
				<h1>Aulas Salvadas</h1>
				<p>{userData.firstName}, você ainda não salcou nenhuma aula. Conforme assistir as aulas e marcá-las como salvas, a lista de suas aulas salvadas aparecerá aqui.</p>
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
