import {Stream} from '@cloudflare/stream-react';
import {type MetaFunction, json, type LoaderFunctionArgs} from '@remix-run/node';
import {useLoaderData} from '@remix-run/react';
import {QuillDeltaToHtmlConverter} from 'quill-delta-to-html';
import {type OpIterator} from 'quill/core';
import {CourseCard} from '~/components/course-card/index.js';
import {CourseService} from '~/services/course.service.server';
import {type TPrismaPayloadGetCourseById} from '~/types/course.type';
import {type TUser} from '~/types/user.type';
import {logger} from '~/utils/logger.util';
import {getUserSession} from '~/utils/session.server';

type CourseLoaderData = {
	course: TPrismaPayloadGetCourseById | undefined;
};

export const loader = async ({request, params}: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));
	const {'course-slug': courseSlug} = params;

	try {
		const {data: course} = await new CourseService().getBySlug(courseSlug!, userSession.data as TUser);

		return json<CourseLoaderData>({
			course,
		});
	} catch (error) {
		logger.logError(`Error loading course: ${(error as Error).message}`);
		return json<CourseLoaderData>({
			course: undefined,
		});
	}
};

export const meta: MetaFunction = ({data}) => [
	{title: (data as CourseLoaderData).course?.name ?? 'Curso da Yoga em Movimento'},
	{name: 'description', content: (data as CourseLoaderData).course?.description ?? 'Conheça o curso oferecido pela Yoga em Movimento'},
];

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
