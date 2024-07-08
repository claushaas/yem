import {Stream} from '@cloudflare/stream-react';
import {
	unstable_defineAction as defineAction,
	unstable_defineLoader as defineLoader,
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
} from '@remix-run/node';
import {
	Await, Form, useLoaderData, type MetaFunction,
} from '@remix-run/react';
import {QuillDeltaToHtmlConverter} from 'quill-delta-to-html';
import {type OpIterator} from 'quill/core';
import {Suspense} from 'react';
import {CheckCircleIcon, BookmarkIcon, HeartIcon} from '@heroicons/react/24/outline';
import {CheckCircleIcon as SolidCheckCircleIcon, BookmarkIcon as SolidBookmarkIcon, HeartIcon as SolidHeartIcon} from '@heroicons/react/24/solid';
import {Breadcrumbs} from '~/components/breadcrumbs.js';
import {VideoPlayer} from '~/components/video-player.js';
import {CourseService} from '~/services/course.service.server';
import {LessonActivityService} from '~/services/lesson-activity.service.server';
import {LessonService} from '~/services/lesson.service.server';
import {ModuleService} from '~/services/module.service.server';
import {type TUser} from '~/types/user.type';
import {getUserSession} from '~/utils/session.server';
import {YemSpinner} from '~/components/yem-spinner.js';
import {type TypeUserSession} from '~/types/user-session.type';
import {NavigateBar} from '~/components/navigation-bar.js';

export const meta: MetaFunction<typeof loader> = ({data}) => [
	{title: data!.lesson?.lesson.name ?? 'Aula do Curso do Yoga em Movimento'},
	{name: 'description', content: data!.lesson?.lesson.description ?? 'Conheça a aula do curso oferecido pela Yoga em Movimento'},
	...data!.meta,
];

export const loader = defineLoader(async ({request, params}: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));
	const {
		'course-slug': courseSlug,
		'module-slug': moduleSlug,
		'lesson-slug': lessonSlug,
	} = params;

	const meta = [
		{tagName: 'link', rel: 'canonical', href: new URL(`/courses/${courseSlug}/${moduleSlug}/${lessonSlug}`, request.url).toString()},
	];

	const userId = (userSession.data as TUser).id;

	const {data: lesson} = new LessonService().getBySlugFromCache(moduleSlug!, lessonSlug!, userSession.data as TUser);
	const {data: module} = new ModuleService().getBySlugFromCache(courseSlug!, moduleSlug!, userSession.data as TUser);
	const {data: course} = new CourseService().getBySlugFromCache(courseSlug!, userSession.data as TUser);
	const userLessonActivity = new LessonActivityService().getLessonActivityForUser(lessonSlug!, userId);

	return {
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
		userLessonActivity,
		userData: userSession.data as TypeUserSession,
	};
});

export const action = defineAction(async ({request, params, response}: ActionFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));
	const {
		'course-slug': courseSlug,
		'module-slug': moduleSlug,
		'lesson-slug': lessonSlug,
	} = params;

	const userId = (userSession.data as TUser).id;

	const formData = await request.formData();

	const action = formData.get('action') as string;
	const completed = (formData.get('completed') as string) === 'true';
	const saved = (formData.get('saved') as string) === 'true';
	const favorited = (formData.get('favorited') as string) === 'true';

	const lessonActivityService = new LessonActivityService();

	switch (action) {
		case 'complete': {
			await lessonActivityService.togleLessonCompletedForUser(lessonSlug!, userId, completed);
			break;
		}

		case 'save': {
			await lessonActivityService.togleLessonSavedForUser(lessonSlug!, userId, saved);
			break;
		}

		case 'favorite': {
			await lessonActivityService.togleLessonFavoritedForUser(lessonSlug!, userId, favorited);
			break;
		}

		default: {
			break;
		}
	}

	response!.headers.set('Location', `/courses/${courseSlug}/${moduleSlug}/${lessonSlug}`);
	response!.status = 200;

	return null;
});

export default function Lesson() {
	const data = useLoaderData<typeof loader>();
	const {lesson, module, course, userLessonActivity, userData} = data;

	const {ops} = lesson?.lesson.content ? JSON.parse(lesson?.lesson.content) as OpIterator : {ops: []};
	const contentConverter = new QuillDeltaToHtmlConverter(ops, {
		multiLineParagraph: false,
	});

	return lesson && (
		<>
			<NavigateBar userData={userData}/>

			<main className='w-full max-w-[95%] sm:max-w-[90%] mx-auto'>
				<Breadcrumbs data={[
					[`/courses/${course.slug}`, course.name], // Course
					[`/courses/${course.slug}/${module.slug}`, module.name], // Module
					[`/courses/${course.slug}/${module.slug}/${lesson.lessonSlug}`, lesson.lesson.name], // Lesson
				]}/>
				<div className='w-full max-w-screen-lg mx-auto'>
					<section id='title' className='flex justify-center gap-5 items-center mb-10'>
						<Suspense fallback={<YemSpinner/>}>
							<Await resolve={userLessonActivity}>
								{userLessonActivity => (
									<Form method='post' className='flex justify-center gap-3 items-center'>
										<input type='text' className='hidden' name='completed' value={userLessonActivity.data?.completed ? 'true' : 'false'}/>
										<input type='text' className='hidden' name='saved' value={userLessonActivity.data?.saved ? 'true' : 'false'}/>
										<input type='text' className='hidden' name='favorited' value={userLessonActivity.data?.favorited ? 'true' : 'false'}/>
										<button type='submit' name='action' value='complete' className='cursor-pointer'>
											{userLessonActivity.data?.completed ? <SolidCheckCircleIcon className='size-8 stroke-purple-11 fill-purple-11'/> : <CheckCircleIcon className='size-8'/>}
										</button>
										<button type='submit' name='action' value='save' className='cursor-pointer'>
											{userLessonActivity.data?.saved ? <SolidBookmarkIcon className='size-8 stroke-purple-11 fill-purple-11'/> : <BookmarkIcon className='size-8'/>}
										</button>
										<button type='submit' name='action' value='favorite' className='cursor-pointer'>
											{userLessonActivity.data?.favorited ? <SolidHeartIcon className='size-8 stroke-purple-11 fill-purple-11'/> : <HeartIcon className='size-8'/>}
										</button>
									</Form>
								)}
							</Await>
						</Suspense>
					</section>

					{lesson.lesson.videoSourceUrl && (
						<section id='video' className='h-fit mb-10 rounded-2xl'>
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

					{lesson.lesson.content && (
					/* eslint-disable-next-line react/no-danger, @typescript-eslint/naming-convention */
						<section dangerouslySetInnerHTML={{__html: contentConverter.convert()}} id='content' className='p-1 sm:p-5 bg-mauvea-2 dark:bg-mauvedarka-2 rounded-2xl flex flex-col gap-6'/>
					)}
				</div>
			</main>
		</>
	);
}
