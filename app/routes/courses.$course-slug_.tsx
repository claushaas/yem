import {Stream} from '@cloudflare/stream-react';
import {type LoaderFunctionArgs, unstable_defineLoader as defineLoader} from '@remix-run/node';
import {Await, type MetaArgs_SingleFetch, useLoaderData} from '@remix-run/react';
import {QuillDeltaToHtmlConverter} from 'quill-delta-to-html';
import {type OpIterator} from 'quill/core';
import {Suspense} from 'react';
import {type TModuleDataForCache} from '~/cache/populate-modules-to-cache.js';
import {Breadcrumbs} from '~/components/breadcrumbs.js';
import {GenericEntityCard} from '~/components/entities-cards.js';
import {NavigateBar} from '~/components/navigation-bar.js';
import {VideoPlayer} from '~/components/video-player.js';
import {YemSpinner} from '~/components/yem-spinner.js';
import {CourseService} from '~/services/course.service.server';
import {LessonActivityService} from '~/services/lesson-activity.service.server';
import {type TypeUserSession} from '~/types/user-session.type';
import {type TUser} from '~/types/user.type';
import {logger} from '~/utils/logger.util';
import {getUserSession} from '~/utils/session.server';

export const meta = ({data}: MetaArgs_SingleFetch<typeof loader>) => [
	{title: data!.course?.name ?? 'Curso da Yoga em Movimento'},
	{name: 'description', content: data!.course?.description ?? 'Conheça o curso oferecido pela Yoga em Movimento'},
	...data!.meta,
];

export const loader = defineLoader(async ({request, params}: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));
	const {'course-slug': courseSlug} = params;

	const meta = [
		{tagName: 'link', rel: 'canonical', href: new URL(`/courses/${courseSlug}`, request.url).toString()},
	];

	try {
		const lessonActivityService = new LessonActivityService();

		const {data: course} = new CourseService().getBySlugFromCache(courseSlug!, userSession.data as TUser);

		const courseActivity = lessonActivityService.getCourseProgressForUser(courseSlug!, (userSession.data as TUser).id);
		const modulesActivity = course.modules.map(module => ({
			[(module as TModuleDataForCache).module.slug]: lessonActivityService.getModuleProgressForUser((module as TModuleDataForCache).module.slug, (userSession.data as TUser).id),
		}));

		return {
			course,
			courseActivity,
			modulesActivity,
			meta,
			userData: userSession.data as TypeUserSession,
		};
	} catch (error) {
		logger.logError(`Error loading course: ${(error as Error).message}`);
		return {
			course: undefined,
			courseActivity: undefined,
			modulesActivity: undefined,
			meta,
			userData: userSession.data as TypeUserSession,
		};
	}
});

export default function Course() {
	const {course, courseActivity, modulesActivity, userData} = useLoaderData<typeof loader>();

	const {ops} = course?.content ? JSON.parse(course?.content) as OpIterator : {ops: []};
	const contentConverter = new QuillDeltaToHtmlConverter(ops, {
		multiLineParagraph: false,
	});

	return course && (
		<>
			<NavigateBar userData={userData}/>

			<main className='w-full max-w-[95%] sm:max-w-[90%] mx-auto'>
				<Breadcrumbs data={[[`/${course.slug}`, course.name]]}/>
				<div className='w-full max-w-screen-lg mx-auto'>
					{course.videoSourceUrl && (
						<section id='video' className='h-fit rounded-2xl mb-10'>
							{!course.videoSourceUrl.startsWith('https://') && (
								<Stream
									controls
									preload='auto'
									className='pt-[56.25%] relative *:absolute *:w-full *:h-full *:top-0 *:left-0 *:inset-0'
									src={course.videoSourceUrl}
									responsive={false}
								/>
							)}
							{course.videoSourceUrl.startsWith('https://') && (
								<VideoPlayer
									title={course.name}
									src={course.videoSourceUrl}
									alt={course.name}
								/>
							)}
						</section>
					)}

					<section id='content' className='p-1 sm:p-5 bg-mauvea-2 dark:bg-mauvedarka-2 rounded-3xl flex flex-col gap-6 mb-10'>
						{course.content && (
						// eslint-disable-next-line react/no-danger, @typescript-eslint/naming-convention
							<div dangerouslySetInnerHTML={{__html: contentConverter.convert()}}/>
						)}
						<Suspense fallback={<YemSpinner/>}>
							<Await resolve={courseActivity}>
								{({data: {percentage}}) => (
									<p className='text-sm'>Progresso do curso: {percentage}% concluído</p>
								)}
							</Await>
						</Suspense>

					</section>

					{course.modules.length > 0 && (
						<section id='modules' className='p-1 sm:p-5 bg-mauvea-2 dark:bg-mauvedarka-2 rounded-3xl flex flex-col gap-6'>
							<h2 className='text-center'>Módulos</h2>
							<div className='flex flex-wrap gap-4 my-4 justify-center'>
								{(course.modules as unknown as TModuleDataForCache[]).map(module => (
									<GenericEntityCard
										key={module.module.id}
										course={module.module}
										to={`./${module.module.slug}`}
										// eslint-disable-next-line unicorn/no-array-reduce
										activity={modulesActivity.reduce((accumulator, activity) => ({...accumulator, ...activity}), {})[module.module.slug] ?? undefined}
									/>
								))}
							</div>
						</section>
					)}
				</div>
			</main>
		</>
	);
}
