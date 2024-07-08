import {type LoaderFunctionArgs, unstable_defineLoader as defineLoader} from '@remix-run/node';
import {type MetaArgs_SingleFetch, useLoaderData} from '@remix-run/react';
import {GenericEntityCard} from '~/components/entities-cards.js';
import {NavigateBar} from '~/components/navigation-bar.js';
import {CourseService} from '~/services/course.service.server';
import {LessonActivityService} from '~/services/lesson-activity.service.server';
import {type TypeUserSession} from '~/types/user-session.type';
import {type TUserRoles} from '~/types/user.type';
import {logger} from '~/utils/logger.util';
import {getUserSession} from '~/utils/session.server';

export const meta = ({data}: MetaArgs_SingleFetch<typeof loader>) => [
	{title: 'Cursos - Yoga em Movimento'},
	{name: 'description', content: 'Conheça os cursos oferecidos pela Yoga em Movimento'},
	...data!.meta,
];

export const loader = defineLoader(async ({request}: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));

	const meta = [
		{tagName: 'link', rel: 'canonical', href: new URL('/courses', request.url).toString()},
	];

	try {
		const lessonActivityService = new LessonActivityService();

		const userRoles = userSession.get('roles') as TUserRoles;
		const {data: courses} = new CourseService().getAllFromCache(userRoles);
		const coursesActivity = typeof userSession.get('id') === 'string' ? courses.map(course => ({
			[course.slug]: lessonActivityService.getCourseProgressForUser(course.slug, userSession.get('id') as string),
		})) : undefined;

		return {
			courses,
			coursesActivity,
			meta,
			userData: userSession.data as TypeUserSession,
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
});

export default function Courses() {
	const {courses, coursesActivity, userData} = useLoaderData<typeof loader>();

	return courses && (
		<>
			<NavigateBar userData={userData}/>

			<main>
				<h1 className='text-center my-16 max-w-[95%] sm:max-w-[90%] mx-auto'>
					Acesse aqui os cursos oferecidos pela Yoga em Movimento
				</h1>
				<div className='max-w-[95%] sm:max-w-[90%] mx-auto flex gap-5 flex-wrap mb-52 justify-center'>
					{courses.map(course => (
						<GenericEntityCard
							key={course.id}
							course={course}
							to={`./${course.slug}`}
							// eslint-disable-next-line unicorn/no-array-reduce
							activity={coursesActivity!.reduce((accumulator, activity) => ({...accumulator, ...activity}), {})[course.slug]}
						/>
					))}
				</div>
			</main>
		</>
	);
}
