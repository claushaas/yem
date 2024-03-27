import {json, type LoaderFunctionArgs} from '@remix-run/node';
import {useLoaderData} from '@remix-run/react';
import {logger} from '#/utils/logger.util';
import {getUserSession} from '~/utils/session.server';
import {ModuleService} from '#/services/module.service';
import {type TUser} from '#/types/user.type';
import {type TPrismaPayloadGetModuleById} from '#/types/module.type';
import {CourseCard} from '~/components/course-card/index.js';

export const loader = async ({request, params}: LoaderFunctionArgs) => {
	const {data: userData} = await getUserSession(request.headers.get('Cookie'));
	const {
		'course-id': courseId,
		'module-id': moduleId,
	} = params;

	try {
		const {data: module} = await new ModuleService().getById(courseId!, moduleId!, userData as TUser);
		return json({module});
	} catch (error) {
		logger.logError(`Error getting module: ${(error as Error).message}`);
		return null;
	}
};

export default function Module() {
	const {module} = useLoaderData<{module: TPrismaPayloadGetModuleById | undefined}>();

	return module && (
		<>
			<div>
				<h1>{module.name}</h1>
				<h2>{module.description}</h2>
				<p>Data de publicação: {module.publicationDate}</p>
				<p>Está publicado: {module.published ? 'sim' : 'não'}</p>
			</div>
			<div>
				<h3>Aulas</h3>
				<div>
					{module.lessons.map(lesson => (
						<CourseCard key={lesson.id} course={lesson} to={`./${lesson.id}`}/>
					))}
				</div>
			</div>
		</>
	);
}
