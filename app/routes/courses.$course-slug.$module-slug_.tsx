import {Stream} from '@cloudflare/stream-react';
import {json, type LoaderFunctionArgs} from '@remix-run/node';
import {useLoaderData, type MetaFunction} from '@remix-run/react';
import {QuillDeltaToHtmlConverter} from 'quill-delta-to-html';
import {type OpIterator} from 'quill/core';
import {type TLessonDataForCache} from '~/cache/populate-lessons-to-cache.js';
import {type TModuleDataForCache} from '~/cache/populate-modules-to-cache.js';
import {GenericEntityCard} from '~/components/generic-entity-card.js';
import {ModuleService} from '~/services/module.service.server';
import {type TUser} from '~/types/user.type';
import {logger} from '~/utils/logger.util';
import {getUserSession} from '~/utils/session.server';

export const meta: MetaFunction<typeof loader> = ({data}) => [
	{title: data!.module?.module.name ?? 'Módulo do Curso do Yoga em Movimento'},
	{name: 'description', content: data!.module?.module.description ?? 'Conheça o módulo do curso oferecido pela Yoga em Movimento'},
	...data!.meta,
];

type ModuleLoaderData = {
	module: TModuleDataForCache | undefined;
	meta: Array<{tagName: string; rel: string; href: string}>;
};

export const loader = async ({request, params}: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));
	const {
		'course-slug': courseSlug,
		'module-slug': moduleSlug,
	} = params;

	const meta = [
		{tagName: 'link', rel: 'canonical', href: new URL(`/courses/${courseSlug}/${moduleSlug}`, request.url).toString()},
	];

	try {
		const {data: module} = new ModuleService().getBySlugFromCache(courseSlug!, moduleSlug!, userSession.data as TUser);

		return json<ModuleLoaderData>({
			module,
			meta,
		});
	} catch (error) {
		logger.logError(`Error loading module: ${(error as Error).message}`);
		return json<ModuleLoaderData>({
			module: undefined,
			meta,
		});
	}
};

export default function Module() {
	const {module} = useLoaderData<ModuleLoaderData>();

	const {ops} = module?.module.content ? JSON.parse(module?.module.content) as OpIterator : {ops: []};
	const contentConverter = new QuillDeltaToHtmlConverter(ops, {
		multiLineParagraph: false,
	});

	return module && (
		<main className='w-full max-w-[95%] sm:max-w-[90%] mx-auto'>
			<div className='w-full max-w-screen-md mx-auto'>
				<section id={module.module.name}>
					<h1 className='text-center'>{module.module.name}</h1>
				</section>
				<div className='p-1 sm:p-5 bg-mauvea-2 dark:bg-mauvedarka-2 rounded-xl flex flex-col gap-6'>
					{/* eslint-disable-next-line react/no-danger, @typescript-eslint/naming-convention */}
					<section dangerouslySetInnerHTML={{__html: contentConverter.convert()}} id='content'/>
					{module.module.videoSourceUrl && (
						<section id='video' className='h-fit'>
							<Stream
								controls
								preload='auto'
								className='pt-[56.25%] relative *:absolute *:w-full *:h-full *:top-0 *:left-0 *:inset-0'
								src={module.module.videoSourceUrl}
								responsive={false}
							/>
						</section>
					)}
					{module.lessons && (
						<section id='modules' className='flex flex-wrap gap-4 my-4'>
							{(module.lessons as unknown as TLessonDataForCache[]).map(lesson => (
								<GenericEntityCard key={lesson.lesson.id} course={lesson.lesson} to={`./${lesson.lesson.slug}`}/>
							))}
						</section>
					)}
				</div>
			</div>
		</main>
	);
}
