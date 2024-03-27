import {json, type LoaderFunctionArgs} from '@remix-run/node';
import {Outlet, useLoaderData} from '@remix-run/react';
import {CourseService} from '#/services/course.service';
import {getUserSession} from '~/utils/session.server';
import {type TUser} from '#/types/user.type';
import {logger} from '#/utils/logger.util';
import {type TPrismaPayloadGetCourseById} from '#/types/course.type';
import {CourseCard} from '~/components/course-card/index.js';

export const loader = async ({request, params}: LoaderFunctionArgs) => {
	const {data: userData} = await getUserSession(request.headers.get('Cookie'));
	const {'course-id': courseId} = params;

	try {
		const {data: course} = await new CourseService().getById(courseId!, userData as TUser);
		return json({course});
	} catch (error) {
		logger.logError(`Error getting course: ${(error as Error).message}`);
		return null;
	}
};

export default function Course() {
	const {course} = useLoaderData<{course: TPrismaPayloadGetCourseById | undefined}>();

	return course && (
		<>
			<div>
				<h1>{course.name}</h1>
				<h2>{course.description}</h2>
				<p>Data de publicação: {course.publicationDate}</p>
				<p>Está publicado: {course.published ? 'sim' : 'não'}</p>
				<p>Está com matrículas abertas: {course?.isSelling ? 'sim' : 'não'}</p>
			</div>
			<div>
				<h3>Módulos</h3>
				<div>
					{course.modules.map(module => (
						<CourseCard key={module.id} course={module} to={`./${module.id}`}/>
					))}
				</div>
			</div>
			<Outlet/>
		</>
	);
}
