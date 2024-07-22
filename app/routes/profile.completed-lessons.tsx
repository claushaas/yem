import {type LoaderFunctionArgs, unstable_defineLoader as defineLoader} from '@remix-run/node';
import {useLoaderData, type MetaArgs_SingleFetch} from '@remix-run/react';
import {LessonEntityCard} from '~/components/entities-cards';
import {LessonActivityService} from '~/services/lesson-activity.service.server';
import {LessonService} from '~/services/lesson.service.server';
import {type TypeUserSession} from '~/types/user-session.type';
import {getUserSession} from '~/utils/session.server';

export const meta = ({data}: MetaArgs_SingleFetch<typeof loader>) => [
	{title: 'Yoga em Movimento - Área Pessoal'},
	{name: 'description', content: 'Área pessoal de cada aluno dentro do site da Yoga em Movimento.'},
	{name: 'robots', content: 'noindex, nofollow'},
	...data!.meta,
];

export const loader = defineLoader(async ({request, response}: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));
	const userData = userSession.data as TypeUserSession;

	if (!userData.id) {
		response!.headers.set('Location', '/');
		response!.status = 303;

		throw response; // eslint-disable-line @typescript-eslint/only-throw-error
	}

	const completedLessons = await new LessonService().getCompletedLessonsByUser(userData);

	const completedLessonsWithActivity = completedLessons.data.map(lesson => ({
		...lesson,
		activity: new LessonActivityService().getLessonActivityForUser(lesson.lessonSlug, userData.id),
	}));

	return {
		meta: [{tagName: 'link', rel: 'canonical', href: new URL('/profile/completed-lessons', request.url).toString()}],
		userData,
		completedLessonsWithActivity,
	};
});

export default function CompletedLessons() {
	const {completedLessonsWithActivity, userData} = useLoaderData<typeof loader>();

	if (completedLessonsWithActivity.length === 0) {
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
				{completedLessonsWithActivity.map(lesson => (
					<LessonEntityCard key={lesson.id} course={lesson.lesson} to={lesson.link} activity={lesson.activity}/>
				))}
			</div>
		</div>
	);
}
