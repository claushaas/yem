import {Stream} from '@cloudflare/stream-react';
import {json, type LoaderFunctionArgs} from '@remix-run/node';
import {type MetaFunction, useLoaderData} from '@remix-run/react';
import {QuillDeltaToHtmlConverter} from 'quill-delta-to-html';
import {type OpIterator} from 'quill/core';
import {CourseCard} from '~/components/generic-entity-card.js';
import {CourseService} from '~/services/course.service.server';
import {type TPrismaPayloadGetCourseBySlug} from '~/types/course.type';
import {type TUser} from '~/types/user.type';
import {logger} from '~/utils/logger.util';
import {getUserSession} from '~/utils/session.server';

export const meta: MetaFunction<typeof loader> = ({data}) => [
	{title: data!.course?.name ?? 'Curso da Yoga em Movimento'},
	{name: 'description', content: data!.course?.description ?? 'Conheça o curso oferecido pela Yoga em Movimento'},
	...data!.meta,
];

type CourseLoaderData = {
	course: TPrismaPayloadGetCourseBySlug | undefined;
	meta: Array<{tagName: string; rel: string; href: string}>;
};

export const loader = async ({request, params}: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));
	const {'course-slug': courseSlug} = params;

	const meta = [
		{tagName: 'link', rel: 'canonical', href: new URL(`/courses/${courseSlug}`, request.url).toString()},
	];

	try {
		const {data: course} = await new CourseService().getBySlug(courseSlug!, userSession.data as TUser);

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
			<div className='w-full max-w-screen-md mx-auto'>
				<section id={course.name}>
					<h1 className='text-center'>{course.name}</h1>
				</section>
				<div className='p-1 sm:p-5 bg-mauvea-2 dark:bg-mauvedarka-2 rounded-xl flex flex-col gap-6'>
					{/* eslint-disable-next-line react/no-danger, @typescript-eslint/naming-convention */}
					<section dangerouslySetInnerHTML={{__html: contentConverter.convert()}} id='content'/>
					{course.videoSourceUrl && (
						<section id='video' className='h-fit'>
							<Stream
								controls
								preload='auto'
								className='pt-[56.25%] relative *:absolute *:w-full *:h-full *:top-0 *:left-0 *:inset-0'
								src={course.videoSourceUrl}
								responsive={false}
							/>
						</section>
					)}
					{course.modules && (
						<section id='modules' className='flex flex-wrap gap-4 my-4'>
							{course.modules.map(module => (
								<CourseCard key={module.id} course={module} to={`./${module.slug}`}/>
							))}
						</section>
					)}
				</div>
			</div>
		</main>
	);
}
