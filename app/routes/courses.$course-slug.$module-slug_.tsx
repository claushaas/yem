import {Stream} from '@cloudflare/stream-react';
import {type LoaderFunctionArgs, unstable_defineLoader as defineLoader} from '@remix-run/node';
import {type MetaArgs_SingleFetch, useLoaderData, Await} from '@remix-run/react';
import {QuillDeltaToHtmlConverter} from 'quill-delta-to-html';
import {type OpIterator} from 'quill/core';
import {Suspense} from 'react';
import {type TLessonDataForCache} from '~/cache/populate-lessons-to-cache.js';
import {LessonEntityCard} from '~/components/entities-cards.js';
import {ModuleService} from '~/services/module.service.server';
import {type TUser} from '~/types/user.type';
import {logger} from '~/utils/logger.util';
import {getUserSession} from '~/utils/session.server';
import {Pagination} from '~/components/pagination.js';
import {Breadcrumbs} from '~/components/breadcrumbs.js';
import {CourseService} from '~/services/course.service.server';
import {VideoPlayer} from '~/components/video-player.js';
import {LessonActivityService} from '~/services/lesson-activity.service.server';
import {YemSpinner} from '~/components/yem-spinner.js';

export const meta = ({data}: MetaArgs_SingleFetch<typeof loader>) => [
	{title: data!.module?.module.name ?? 'Módulo do Curso do Yoga em Movimento'},
	{name: 'description', content: data!.module?.module.description ?? 'Conheça o módulo do curso oferecido pela Yoga em Movimento'},
	...data!.meta,
];

export const loader = defineLoader(async ({request, params}: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));

	const {
		'course-slug': courseSlug,
		'module-slug': moduleSlug,
	} = params;

	const url = new URL(request.url);
	const pageString = url.searchParams.get('page');
	const page = (pageString && !Number.isNaN(pageString)) ? Number(pageString) : 1;

	const meta = [
		{tagName: 'link', rel: 'canonical', href: new URL(`/courses/${courseSlug}/${moduleSlug}`, request.url).toString()},
	];

	try {
		const {data: module} = new ModuleService().getBySlugFromCache(courseSlug!, moduleSlug!, userSession.data as TUser, page);
		const {data: course} = new CourseService().getBySlugFromCache(courseSlug!, userSession.data as TUser);
		const moduleActivity = new LessonActivityService().getModuleProgressForUser(moduleSlug!, (userSession.data as TUser).id);

		return {
			module,
			moduleActivity,
			meta,
			actualPage: page,
			course: {
				slug: course?.slug ?? '',
				name: course?.name ?? '',
			},
		};
	} catch (error) {
		logger.logError(`Error loading module: ${(error as Error).message}`);
		return {
			module: undefined,
			moduleActivity: undefined,
			meta,
			actualPage: page,
			course: undefined,
		};
	}
});

export default function Module() {
	const data = useLoaderData<typeof loader>();
	const {module, actualPage, course, moduleActivity} = data;

	const {ops} = module?.module.content ? JSON.parse(module?.module.content) as OpIterator : {ops: []};
	const contentConverter = new QuillDeltaToHtmlConverter(ops, {
		multiLineParagraph: false,
	});

	return module && (
		<main className='w-full max-w-[95%] sm:max-w-[90%] mx-auto'>
			<Breadcrumbs data={[
				[`/courses/${course.slug}`, course.name], // Course
				[`/courses/${course.slug}/${module.moduleSlug}`, module.module.name], // Module
			]}/>
			<div className='w-full max-w-screen-lg mx-auto'>

				{module.module.videoSourceUrl && (
					<section id='video' className='h-fit rounded-2xl mb-10'>
						{!module.module.videoSourceUrl.startsWith('https://') && (
							<Stream
								controls
								preload='auto'
								className='pt-[56.25%] relative *:absolute *:w-full *:h-full *:top-0 *:left-0 *:inset-0'
								src={module.module.videoSourceUrl}
								responsive={false}
							/>
						)}
						{module.module.videoSourceUrl.startsWith('https://') && (
							<VideoPlayer
								title={module.module.name}
								src={module.module.videoSourceUrl}
								alt={module.module.name}
							/>
						)}
					</section>
				)}

				<section id='content' className='p-1 sm:p-5 bg-mauvea-2 dark:bg-mauvedarka-2 rounded-2xl flex flex-col gap-6 mb-10'>
					{module.module.content && (
						// eslint-disable-next-line react/no-danger, @typescript-eslint/naming-convention
						<section dangerouslySetInnerHTML={{__html: contentConverter.convert()}}/>
					)}
					<Suspense fallback={<YemSpinner/>}>
						<Await resolve={moduleActivity}>
							{({data: {percentage}}) => (
								<p className='text-sm'>Progresso do módulo: {percentage}% concluído</p>
							)}
						</Await>
					</Suspense>
				</section>

				{module.lessons.length > 1 && (
					<section id='lessons' className='p-1 sm:p-5 bg-mauvea-2 dark:bg-mauvedarka-2 rounded-2xl flex flex-col gap-6'>
						<h2 className='text-center'>Aulas</h2>
						<div className='flex flex-wrap justify-center gap-4 my-4'>
							{(module.lessons as unknown as TLessonDataForCache[]).map(lesson => (
								<LessonEntityCard key={lesson.lesson.id} course={lesson.lesson} to={`./${lesson.lesson.slug}`}/>
							))}
						</div>
						{module.pages > 1 && <Pagination pages={module.pages} actualPage={actualPage}/>}
					</section>
				)}

			</div>
		</main>
	);
}
