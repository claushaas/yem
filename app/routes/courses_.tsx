import {json, type LoaderFunctionArgs} from '@remix-run/node';
import {useLoaderData, type MetaFunction} from '@remix-run/react';
import {CourseCard} from '~/components/course-card/index.js';
import {CourseService} from '~/services/course.service.server';
import {type TPrismaPayloadGetAllCourses} from '~/types/course.type';
import {type TUserRoles} from '~/types/user.type';
import {logger} from '~/utils/logger.util';
import {getUserSession} from '~/utils/session.server';

export const meta: MetaFunction = () => [
	{title: 'Cursos - Yoga em Movimento'},
	{name: 'description', content: 'Conheça os cursos oferecidos pela Yoga em Movimento'},
];

type CoursesLoaderData = {
	courses: TPrismaPayloadGetAllCourses | undefined;
};

export const loader = async ({request}: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));

	try {
		const {data: courses} = await new CourseService().getAll(userSession.get('roles') as TUserRoles);

		return json<CoursesLoaderData>({
			courses,
		});
	} catch (error) {
		logger.logError(`Error loading courses: ${(error as Error).message}`);
		return json<CoursesLoaderData>({
			courses: undefined,
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
					<CourseCard key={course.id} course={course} to={`./${course.slug}`}/>
				))}
			</div>
		</main>
	);
}
