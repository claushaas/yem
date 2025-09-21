/** biome-ignore-all lint/correctness/useUniqueElementIds: . */
/** biome-ignore-all lint/style/noNonNullAssertion: . */
import { Stream } from '@cloudflare/stream-react';
import type { OpIterator } from 'quill/core';
import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html';
import { Suspense } from 'react';
import {
	Await,
	type LoaderFunctionArgs,
	type MetaArgs,
	useLoaderData,
} from 'react-router';
import { Breadcrumbs } from '~/components/breadcrumbs.js';
import { GenericEntityCard } from '~/components/entities-cards.js';
import { NavigateBar } from '~/components/navigation-bar.js';
import { VideoPlayer } from '~/components/video-player.js';
import { YemSpinner } from '~/components/yem-spinner.js';
import { CourseService } from '~/services/course.service.server';
import { LessonActivityService } from '~/services/lesson-activity.service.server';
import type { TUser } from '~/types/user.type';
import type { TypeUserSession } from '~/types/user-session.type';
import { logger } from '~/utils/logger.util';
import { getUserSession } from '~/utils/session.server';

export const meta = ({ data }: MetaArgs<typeof loader>) => [
	{ title: data!.course?.name ?? 'Curso da Yoga em Movimento' },
	{
		content:
			data!.course?.description ??
			'Conheça o curso oferecido pela Yoga em Movimento',
		name: 'description',
	},
	...data!.meta,
];

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));
	const { 'course-slug': courseSlug } = params;

	const meta = [
		{
			href: new URL(`/courses/${courseSlug}`, request.url).toString(),
			rel: 'canonical',
			tagName: 'link',
		},
	];

	try {
		const lessonActivityService = new LessonActivityService();

		const { data: course } = await new CourseService().getOneForUser(
			courseSlug!,
			userSession.data as TUser,
		);

		const courseActivity = lessonActivityService.getCourseProgressForUser(
			courseSlug!,
			(userSession.data as TUser).id,
		);

		const modulesActivity = course.modules.map((module) => ({
			[module.module.slug]: lessonActivityService.getModuleProgressForUser(
				module.module.slug,
				(userSession.data as TUser).id,
			),
		}));

		return {
			course,
			courseActivity,
			meta,
			modulesActivity,
			userData: userSession.data as TypeUserSession,
		};
	} catch (error) {
		logger.logError(`Error loading course: ${(error as Error).message}`);
		return {
			course: undefined,
			courseActivity: undefined,
			meta,
			modulesActivity: undefined,
			userData: userSession.data as TypeUserSession,
		};
	}
};

export default function Course() {
	const { course, courseActivity, modulesActivity, userData } =
		useLoaderData<typeof loader>();

	const { ops } = course?.content
		? (JSON.parse(course?.content) as OpIterator)
		: { ops: [] };
	const contentConverter = new QuillDeltaToHtmlConverter(ops, {
		multiLineParagraph: false,
	});

	return (
		course && (
			<>
				<NavigateBar userData={userData} />

				<main className="w-full max-w-[95%] sm:max-w-[90%] mx-auto">
					<Breadcrumbs data={[[`/${course.slug}`, course.name]]} />
					<div className="w-full max-w-(--breakpoint-lg) mx-auto">
						{course.videoSourceUrl && (
							<section className="h-fit rounded-2xl mb-10" id="video">
								{!course.videoSourceUrl.startsWith('https://') && (
									<Stream
										className="pt-[56.25%] relative *:absolute *:w-full *:h-full *:top-0 *:left-0 *:inset-0"
										controls
										preload="auto"
										responsive={false}
										src={course.videoSourceUrl}
									/>
								)}
								{course.videoSourceUrl.startsWith('https://') && (
									<VideoPlayer
										alt={course.name}
										src={course.videoSourceUrl}
										title={course.name}
									/>
								)}
							</section>
						)}

						<section
							className="p-1 sm:p-5 bg-mauvea-2 dark:bg-mauvedarka-2 rounded-3xl flex flex-col gap-6 mb-10"
							id="content"
						>
							{course.content && (
								// eslint-disable-next-line react/no-danger, @typescript-eslint/naming-convention
								<div
									// biome-ignore lint/security/noDangerouslySetInnerHtml: .
									dangerouslySetInnerHTML={{
										__html: contentConverter.convert(),
									}}
								/>
							)}
							<Suspense fallback={<YemSpinner />}>
								<Await resolve={courseActivity}>
									{({ data: { percentage } }) => (
										<p className="text-sm">
											Progresso do curso: {percentage}% concluído
										</p>
									)}
								</Await>
							</Suspense>
						</section>

						{course.modules.length > 0 && (
							<section
								className="p-1 sm:p-5 bg-mauvea-2 dark:bg-mauvedarka-2 rounded-3xl flex flex-col gap-6"
								id="modules"
							>
								<h2 className="text-center">Módulos</h2>
								<div className="flex flex-wrap gap-4 my-4 justify-center">
									{course.modules.map((module) => (
										<GenericEntityCard
											activity={
												modulesActivity.reduce(
													(accumulator, activity) => ({
														// biome-ignore lint/performance/noAccumulatingSpread: .
														...accumulator,
														...activity,
													}),
													{},
												)[module.module.slug] ?? undefined
											}
											course={module.module}
											key={module.module.id}
											// eslint-disable-next-line unicorn/no-array-reduce
											to={`./${module.module.slug}`}
										/>
									))}
								</div>
							</section>
						)}
					</div>
				</main>
			</>
		)
	);
}
