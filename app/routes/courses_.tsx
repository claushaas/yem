/** biome-ignore-all lint/style/noNonNullAssertion: . */
import {
	type LoaderFunctionArgs,
	type MetaArgs,
	useLoaderData,
} from 'react-router';
import { GenericEntityCard } from '~/components/entities-cards.js';
import { NavigateBar } from '~/components/navigation-bar.js';
import { CourseService } from '~/services/course.service.server';
import { LessonActivityService } from '~/services/lesson-activity.service.server';
import type { TypeUserSession } from '~/types/user-session.type';
import { logger } from '~/utils/logger.util';
import { getUserSession } from '~/utils/session.server';

export const meta = ({ data }: MetaArgs<typeof loader>) => [
	{ title: 'Cursos - Yoga em Movimento' },
	{
		content: 'Conheça os cursos oferecidos pela Yoga em Movimento',
		name: 'description',
	},
	...data!.meta,
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));

	const meta = [
		{
			href: new URL('/courses', request.url).toString(),
			rel: 'canonical',
			tagName: 'link',
		},
	];

	try {
		const lessonActivityService = new LessonActivityService();

		const userData = userSession.data as TypeUserSession;
		const { data: courses } = await new CourseService().getAllForUser(userData);

		const coursesActivity =
			typeof userSession.get('id') === 'string'
				? courses.map((course) => ({
						[course.slug]: lessonActivityService.getCourseProgressForUser(
							course.slug,
							userSession.get('id') as string,
						),
					}))
				: undefined;

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
	const { courses, coursesActivity, userData } = useLoaderData<typeof loader>();

	return (
		courses && (
			<>
				<NavigateBar userData={userData} />

				<main>
					<h1 className="text-center my-16 max-w-[95%] sm:max-w-[90%] mx-auto">
						Acesse aqui os cursos oferecidos pela Yoga em Movimento
					</h1>
					<div className="max-w-[95%] sm:max-w-[90%] mx-auto flex gap-5 flex-wrap mb-52 justify-center">
						{courses.map((course) => (
							<GenericEntityCard
								activity={
									coursesActivity?.reduce(
										(accumulator, activity) => ({
											// biome-ignore lint/performance/noAccumulatingSpread: .
											...accumulator,
											...activity,
										}),
										{},
									)[course.slug] ?? undefined
								}
								course={course}
								key={course.id}
								to={`./${course.slug}`}
							/>
						))}
					</div>
				</main>
			</>
		)
	);
}
