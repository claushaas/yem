import {json, type LoaderFunctionArgs} from '@remix-run/node';
import {useLoaderData, type MetaFunction} from '@remix-run/react';
import {type TCourseDataForCache} from '~/cache/populate-courses-to-cache.js';
import {GenericEntityCard} from '~/components/generic-entity-card.js';
import {CourseService} from '~/services/course.service.server';
import {type TUserRoles} from '~/types/user.type';
import {logger} from '~/utils/logger.util';
import {getUserSession} from '~/utils/session.server';

export const meta: MetaFunction<typeof loader> = ({data}) => [
	{title: 'Cursos - Yoga em Movimento'},
	{name: 'description', content: 'Conheça os cursos oferecidos pela Yoga em Movimento'},
	...data!.meta,
];

type CoursesLoaderData = {
	courses: TCourseDataForCache[] | undefined;
	meta: Array<{tagName: string; rel: string; href: string}>;
};

export const loader = async ({request}: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));

	const meta = [
		{tagName: 'link', rel: 'canonical', href: new URL('/courses', request.url).toString()},
	];

	try {
		const userRoles = userSession.get('roles') as TUserRoles;
		const {data: courses} = new CourseService().getAllFromCache(userRoles);

		return json<CoursesLoaderData>({
			courses,
			meta,
		});
	} catch (error) {
		logger.logError(`Error loading courses: ${(error as Error).message}`);
		return json<CoursesLoaderData>({
			courses: undefined,
			meta,
		});
	}
};

export default function Courses() {
	const {courses} = useLoaderData<CoursesLoaderData>();

	return courses && (
		<main>
			<h1 className='text-center my-16 max-w-[95%] sm:max-w-[90%] mx-auto'>
				Acesse aqui os cursos oferecidos pela Yoga em Movimento
			</h1>
			<div className='max-w-[95%] sm:max-w-[90%] mx-auto flex gap-5 flex-wrap mb-52 justify-center'>
				{courses.map(course => (
					<GenericEntityCard key={course.id} course={course} to={`./${course.slug}`}/>
				))}
			</div>
		</main>
	);
}
