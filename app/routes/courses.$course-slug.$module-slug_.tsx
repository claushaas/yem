import {Stream} from '@cloudflare/stream-react';
import {json, type LoaderFunctionArgs} from '@remix-run/node';
import {useLoaderData, type MetaFunction} from '@remix-run/react';
import {QuillDeltaToHtmlConverter} from 'quill-delta-to-html';
import {type OpIterator} from 'quill/core';
import {CourseCard} from '~/components/course-card/index.js';
import {ModuleService} from '~/services/module.service.server';
import {type TPrismaPayloadGetModuleById} from '~/types/module.type';
import {type TUser} from '~/types/user.type';
import {logger} from '~/utils/logger.util';
import {getUserSession} from '~/utils/session.server';

type ModuleLoaderData = {
	module: TPrismaPayloadGetModuleById | undefined;
};

export const loader = async ({request, params}: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));
	const {
		'course-slug': courseSlug,
		'module-slug': moduleSlug,
	} = params;

	try {
		const {data: module} = await new ModuleService().getBySlug(courseSlug!, moduleSlug!, userSession.data as TUser);

		return json<ModuleLoaderData>({
			module,
		});
	} catch (error) {
		logger.logError(`Error loading module: ${(error as Error).message}`);
		return json<ModuleLoaderData>({
			module: undefined,
		});
	}
};

export const meta: MetaFunction = ({data}) => [
	{title: (data as ModuleLoaderData).module?.name ?? 'Módulo do Curso do Yoga em Movimento'},
	{name: 'description', content: (data as ModuleLoaderData).module?.description ?? 'Conheça o módulo do curso oferecido pela Yoga em Movimento'},
];

export default function Module() {
	const {module} = useLoaderData<ModuleLoaderData>();

	const {ops} = module?.content ? JSON.parse(module?.content) as OpIterator : {ops: []};
	const contentConverter = new QuillDeltaToHtmlConverter(ops, {
		multiLineParagraph: false,
	});

	return module && (
		<main className='w-full max-w-[95%] sm:max-w-[90%] mx-auto'>
			<div className='w-full max-w-screen-md mx-auto'>
				<section id={module.name}>
					<h1 className='text-center'>{module.name}</h1>
				</section>
				<div className='p-1 sm:p-5 bg-mauvea-2 dark:bg-mauvedarka-2 rounded-xl flex flex-col gap-6'>
					{/* eslint-disable-next-line react/no-danger, @typescript-eslint/naming-convention */}
					<section dangerouslySetInnerHTML={{__html: contentConverter.convert()}} id='content'/>
					{module.videoSourceUrl && (
						<section id='video' className='h-fit'>
							<Stream
								controls
								className='pt-[56.25%] relative *:absolute *:w-full *:h-full *:top-0 *:left-0 *:inset-0'
								src={module.videoSourceUrl}
								responsive={false}
							/>
						</section>
					)}
					{module.lessons && (
						<section id='modules' className='flex flex-wrap gap-4 my-4'>
							{module.lessons.map(lesson => (
								<CourseCard key={lesson.id} course={lesson} to={`./${lesson.slug}`}/>
							))}
						</section>
					)}
				</div>
			</div>
		</main>
	);
}
