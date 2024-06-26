import {Stream} from '@cloudflare/stream-react';
import {ChevronRightIcon} from '@heroicons/react/24/outline';
import {json, type LoaderFunctionArgs} from '@remix-run/node';
import {Link, useLoaderData, type MetaFunction} from '@remix-run/react';
import {QuillDeltaToHtmlConverter} from 'quill-delta-to-html';
import {type OpIterator} from 'quill/core';
import {type TLessonDataForCache} from '~/cache/populate-lessons-to-cache.js';
import {Breadcrumbs} from '~/components/breadcrumbs.js';
import {VideoPlayer} from '~/components/video-player.js';
import {CourseService} from '~/services/course.service.server';
import {LessonService} from '~/services/lesson.service.server';
import {ModuleService} from '~/services/module.service.server';
import {type TUser} from '~/types/user.type';
import {logger} from '~/utils/logger.util';
import {getUserSession} from '~/utils/session.server';

export const meta: MetaFunction<typeof loader> = ({data}) => [
	{title: data!.lesson?.lesson.name ?? 'Aula do Curso do Yoga em Movimento'},
	{name: 'description', content: data!.lesson?.lesson.description ?? 'Conheça a aula do curso oferecido pela Yoga em Movimento'},
	...data!.meta,
];

type LessonLoaderData = {
	lesson: TLessonDataForCache | undefined;
	meta: Array<{tagName: string; rel: string; href: string}>;
	course: {slug: string; name: string} | undefined;
	module: {slug: string; name: string} | undefined;
};

export const loader = async ({request, params}: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));
	const {
		'course-slug': courseSlug,
		'module-slug': moduleSlug,
		'lesson-slug': lessonSlug,
	} = params;

	const meta = [
		{tagName: 'link', rel: 'canonical', href: new URL(`/courses/${courseSlug}/${moduleSlug}/${lessonSlug}`, request.url).toString()},
	];

	try {
		const {data: lesson} = new LessonService().getBySlugFromCache(moduleSlug!, lessonSlug!, userSession.data as TUser);
		const {data: module} = new ModuleService().getBySlugFromCache(courseSlug!, moduleSlug!, userSession.data as TUser);
		const {data: course} = new CourseService().getBySlugFromCache(courseSlug!, userSession.data as TUser);

		return json<LessonLoaderData>({
			lesson,
			module: {
				slug: module?.moduleSlug ?? '',
				name: module?.module.name ?? '',
			},
			course: {
				slug: course?.slug ?? '',
				name: course?.name ?? '',
			},
			meta,
		});
	} catch (error) {
		logger.logError(`Error loading module: ${(error as Error).message}`);
		return json<LessonLoaderData>({
			lesson: undefined,
			meta,
			module: undefined,
			course: undefined,
		});
	}
};

export default function Lesson() {
	const data = useLoaderData<LessonLoaderData>();
	const {lesson, module, course} = data;

	const {ops} = lesson?.lesson.content ? JSON.parse(lesson?.lesson.content) as OpIterator : {ops: []};
	const contentConverter = new QuillDeltaToHtmlConverter(ops, {
		multiLineParagraph: false,
	});

	return lesson && (
		<main className='w-full max-w-[95%] sm:max-w-[90%] mx-auto'>
			<Breadcrumbs data={[
				[`/courses/${course!.slug}`, course!.name], // Course
				[`/courses/${course!.slug}/${module!.slug}`, module!.name], // Module
				[`/courses/${course!.slug}/${module!.slug}/${lesson.lessonSlug}`, lesson.lesson.name], // Lesson
			]}/>
			<div className='w-full max-w-screen-md mx-auto'>
				<section id={lesson.lesson.name}>
					<h1 className='text-center'>{lesson.lesson.name}</h1>
				</section>
				<div className='p-1 sm:p-5 bg-mauvea-2 dark:bg-mauvedarka-2 rounded-xl flex flex-col gap-6'>
					{/* eslint-disable-next-line react/no-danger, @typescript-eslint/naming-convention */}
					<section dangerouslySetInnerHTML={{__html: contentConverter.convert()}} id='content'/>
					{lesson.lesson.videoSourceUrl && (
						<section id='video' className='h-fit'>
							{!lesson.lesson.videoSourceUrl.startsWith('https://') && (
								<Stream
									controls
									preload='auto'
									className='pt-[56.25%] relative *:absolute *:w-full *:h-full *:top-0 *:left-0 *:inset-0'
									src={lesson.lesson.videoSourceUrl}
									responsive={false}
								/>
							)}
							{lesson.lesson.videoSourceUrl.startsWith('https://') && (
								<VideoPlayer
									title={lesson.lesson.name}
									src={lesson.lesson.videoSourceUrl}
									alt={lesson.lesson.name}
								/>
							)}
						</section>
					)}
				</div>
			</div>
		</main>
	);
}
