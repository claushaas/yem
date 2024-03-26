import {json, type LoaderFunctionArgs} from '@remix-run/node';
import {CourseService} from '#/services/course.service';
import {getUserSession} from '~/utils/session.server';
import {type TUser} from '#/types/user.type';
import {logger} from '#/utils/logger.util';

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
	return (
		<div>
			<h1>Detalhes do curso</h1>
		</div>
	);
}
