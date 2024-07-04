import {Stream} from '@cloudflare/stream-react';
import {json, type LoaderFunctionArgs} from '@remix-run/node';
import {type MetaFunction, useLoaderData} from '@remix-run/react';
import {QuillDeltaToHtmlConverter} from 'quill-delta-to-html';
import {type OpIterator} from 'quill/core';
import {type TCourseDataForCache} from '~/cache/populate-courses-to-cache.js';
import {type TModuleDataForCache} from '~/cache/populate-modules-to-cache.js';
import {Breadcrumbs} from '~/components/breadcrumbs.js';
import {GenericEntityCard} from '~/components/generic-entity-card.js';
import {VideoPlayer} from '~/components/video-player.js';
import {CourseService} from '~/services/course.service.server';
import {type TUser} from '~/types/user.type';
import {logger} from '~/utils/logger.util';
import {getUserSession} from '~/utils/session.server';

export const meta: MetaFunction<typeof loader> = ({data}) => [
	{title: data!.course?.name ?? 'Curso da Yoga em Movimento'},
	{name: 'description', content: data!.course?.description ?? 'Conheça o curso oferecido pela Yoga em Movimento'},
	...data!.meta,
];

type CourseLoaderData = {
	course: TCourseDataForCache | undefined;
	meta: Array<{tagName: string; rel: string; href: string}>;
};

export const loader = async ({request, params}: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));
	const {'course-slug': courseSlug} = params;

	const meta = [
		{tagName: 'link', rel: 'canonical', href: new URL(`/courses/${courseSlug}`, request.url).toString()},
	];

	try {
		const {data: course} = new CourseService().getBySlugFromCache(courseSlug!, userSession.data as TUser);

		return json<CourseLoaderData>({
			course,
			meta,
		});
	} catch (error) {
		logger.logError(`Error loading course: ${(error as Error).message}`);
		return json<CourseLoaderData>({
			course: undefined,
			meta,
		});
	}
};

export default function Course() {
	const {course} = useLoaderData<CourseLoaderData>();

	const {ops} = course?.content ? JSON.parse(course?.content) as OpIterator : {ops: []};
	const contentConverter = new QuillDeltaToHtmlConverter(ops, {
		multiLineParagraph: false,
	});

	return course && (
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

				{course.content && (
					// eslint-disable-next-line react/no-danger, @typescript-eslint/naming-convention
					<section dangerouslySetInnerHTML={{__html: contentConverter.convert()}} id='content' className='p-1 sm:p-5 bg-mauvea-2 dark:bg-mauvedarka-2 rounded-3xl flex flex-col gap-6 mb-10'/>
				)}

				{course.modules.length > 0 && (
					<section id='modules' className='p-1 sm:p-5 bg-mauvea-2 dark:bg-mauvedarka-2 rounded-3xl flex flex-col gap-6'>
						<h2 className='text-center'>Módulos</h2>
						<div className='flex flex-wrap gap-4 my-4 justify-center'>
							{(course.modules as unknown as TModuleDataForCache[]).map(module => (
								<GenericEntityCard key={module.module.id} course={module.module} to={`./${module.module.slug}`}/>
							))}
						</div>
					</section>
				)}
			</div>
		</main>
	);
}
