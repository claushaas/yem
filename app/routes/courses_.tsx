import {type LoaderFunctionArgs} from '@remix-run/node';
import {Link, type MetaArgs, useLoaderData} from '@remix-run/react';
import {GenericEntityCard} from '~/components/entities-cards.js';
import {NavigateBar} from '~/components/navigation-bar.js';
import {CourseService} from '~/services/course.service.server';
import {LessonActivityService} from '~/services/lesson-activity.service.server';
import {type TypeUserSession} from '~/types/user-session.type';
import {logger} from '~/utils/logger.util';
import {getUserSession} from '~/utils/session.server';

export const meta = ({data}: MetaArgs<typeof loader>) => [
	{title: 'Cursos - Yoga em Movimento'},
	{name: 'description', content: 'Conheça os cursos oferecidos pela Yoga em Movimento'},
	...data!.meta,
];

export const loader = async ({request}: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));

	const meta = [
		{tagName: 'link', rel: 'canonical', href: new URL('/courses', request.url).toString()},
	];

	try {
		const lessonActivityService = new LessonActivityService();

		const userData = userSession.data as TypeUserSession;
		const {data: courses} = new CourseService().getAllFromCache(userData);
		const coursesActivity = typeof userSession.get('id') === 'string' ? courses.map(course => ({
			[course.slug]: lessonActivityService.getCourseProgressForUser(course.slug, userSession.get('id') as string),
		})) : undefined;

		return {
			courses,
			coursesActivity,
			meta,
			userData,
		};
	} catch (error) {
		logger.logError(`Error loading courses: ${(error as Error).message}`);
		return {
			courses: undefined,
			coursesActivity: undefined,
			meta,
			userData: userSession.data as TypeUserSession,
		};
	}
};

export default function Courses() {
	const {courses, coursesActivity, userData} = useLoaderData<typeof loader>();

	return courses && (
		<>
			<NavigateBar userData={userData}/>

			<main>
				{userData.id && (
					<div className='max-w-screen-lg w-[95%] sm:w-[90%] mx-auto bg-purplea-4 p-5 rounded-2xl my-10'>
						<p className='mb-4'>Querido(a) aluno(a), recentemente iniciamos a transição para a nova versão da plataforma da Yoga em Movimento, que você está acessando neste momento. Nem todas aulas e cursos estão publicadas na plataforma nova ainda, mas você pode encontrá-las na plataforma antiga, acessando através do link abaixo</p>
						<p className='text-center'><Link to='https://escola.yogaemmovimento.com' target='_blank'>https://escola.yogaemmovimento.com</Link></p>
					</div>
				)}
				<h1 className='text-center my-16 max-w-[95%] sm:max-w-[90%] mx-auto'>
					Acesse aqui os cursos oferecidos pela Yoga em Movimento
				</h1>
				<div className='max-w-[95%] sm:max-w-[90%] mx-auto flex gap-5 flex-wrap mb-52 justify-center'>
					{courses.map(course => (
						<GenericEntityCard
							key={course.id}
							course={course}
							to={`./${course.slug}`}
							activity={coursesActivity?.reduce((accumulator, activity) => ({...accumulator, ...activity}), {})[course.slug] ?? undefined}
						/>
					))}
				</div>
			</main>
		</>
	);
}
