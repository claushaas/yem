import {Stream} from '@cloudflare/stream-react';
import {json, type LoaderFunctionArgs} from '@remix-run/node';
import {useLoaderData, type MetaFunction} from '@remix-run/react';
import {QuillDeltaToHtmlConverter} from 'quill-delta-to-html';
import {type OpIterator} from 'quill/core';
import {LessonService} from '~/services/lesson.service.server';
import {type TPrismaPayloadGetLessonById} from '~/types/lesson.type';
import {type TUser} from '~/types/user.type';
import {logger} from '~/utils/logger.util';
import {getUserSession} from '~/utils/session.server';

export const meta: MetaFunction<typeof loader> = ({data}) => [
	{title: data!.lesson?.name ?? 'Aula do Curso do Yoga em Movimento'},
	{name: 'description', content: data!.lesson?.description ?? 'Conheça a aula do curso oferecido pela Yoga em Movimento'},
	...data!.meta,
];

type LessonLoaderData = {
	lesson: TPrismaPayloadGetLessonById | undefined;
	meta: Array<{tagName: string; rel: string; href: string}>;
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
		const {data: lesson} = await new LessonService().getBySlug(courseSlug!, moduleSlug!, lessonSlug!, userSession.data as TUser);

		return json<LessonLoaderData>({
			lesson,
			meta,
		});
	} catch (error) {
		logger.logError(`Error loading module: ${(error as Error).message}`);
		return json<LessonLoaderData>({
			lesson: undefined,
			meta,
		});
	}
};

export default function Lesson() {
	const {lesson} = useLoaderData<LessonLoaderData>();

	const {ops} = lesson?.content ? JSON.parse(lesson?.content) as OpIterator : {ops: []};
	const contentConverter = new QuillDeltaToHtmlConverter(ops, {
		multiLineParagraph: false,
	});

	return lesson && (
		<main className='w-full max-w-[95%] sm:max-w-[90%] mx-auto'>
			<div className='w-full max-w-screen-md mx-auto'>
				<section id={lesson.name}>
					<h1 className='text-center'>{lesson.name}</h1>
				</section>
				<div className='p-1 sm:p-5 bg-mauvea-2 dark:bg-mauvedarka-2 rounded-xl flex flex-col gap-6'>
					{/* eslint-disable-next-line react/no-danger, @typescript-eslint/naming-convention */}
					<section dangerouslySetInnerHTML={{__html: contentConverter.convert()}} id='content'/>
					{lesson.videoSourceUrl && (
						<section id='video' className='h-fit'>
							<Stream
								controls
								className='pt-[56.25%] relative *:absolute *:w-full *:h-full *:top-0 *:left-0 *:inset-0'
								src={lesson.videoSourceUrl}
								responsive={false}
							/>
						</section>
					)}
				</div>
			</div>
		</main>
	);
}
