/** biome-ignore-all lint/correctness/useUniqueElementIds: . */
/** biome-ignore-all lint/style/noNonNullAssertion: . */
import { Stream } from '@cloudflare/stream-react';
import {
	BookmarkIcon,
	CheckCircleIcon,
	HeartIcon,
} from '@heroicons/react/24/outline';
import {
	BookmarkIcon as SolidBookmarkIcon,
	CheckCircleIcon as SolidCheckCircleIcon,
	HeartIcon as SolidHeartIcon,
} from '@heroicons/react/24/solid';
import * as Tooltip from '@radix-ui/react-tooltip';
import type { OpIterator } from 'quill/core';
import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html';
import { Suspense } from 'react';
import {
	type ActionFunctionArgs,
	Await,
	Form,
	type LoaderFunctionArgs,
	type MetaFunction,
	redirect,
	useLoaderData,
} from 'react-router';
import { Breadcrumbs } from '~/components/breadcrumbs.js';
import { NavigateBar } from '~/components/navigation-bar.js';
import { VideoPlayer } from '~/components/video-player.js';
import { YemSpinner } from '~/components/yem-spinner.js';
import { CourseService } from '~/services/course.service.server';
import { LessonService } from '~/services/lesson.service.server';
import { LessonActivityService } from '~/services/lesson-activity.service.server';
import { ModuleService } from '~/services/module.service.server';
import type { TUser } from '~/types/user.type';
import type { TypeUserSession } from '~/types/user-session.type';
import { getUserSession } from '~/utils/session.server';

export const meta: MetaFunction<typeof loader> = ({ data }) => [
	{ title: data?.lesson?.lesson.name ?? 'Aula do Curso do Yoga em Movimento' },
	{
		content:
			data?.lesson?.lesson.description ??
			'Conheça a aula do curso oferecido pela Yoga em Movimento',
		name: 'description',
	},
	...(Array.isArray(data?.meta) ? data.meta : []),
];

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));
	const {
		'course-slug': courseSlug,
		'module-slug': moduleSlug,
		'lesson-slug': lessonSlug,
	} = params;

	const meta = [
		{
			href: new URL(
				`/courses/${courseSlug}/${moduleSlug}/${lessonSlug}`,
				request.url,
			).toString(),
			rel: 'canonical',
			tagName: 'link',
		},
	];

	const userId = (userSession.data as TUser).id;

	const { data: lesson } = new LessonService().getBySlugFromCache(
		courseSlug!,
		moduleSlug!,
		lessonSlug!,
		userSession.data as TUser,
	);
	const { data: module } = new ModuleService().getBySlugFromCache(
		courseSlug!,
		moduleSlug!,
		userSession.data as TUser,
		[],
	);
	const { data: course } = new CourseService().getBySlugFromCache(
		courseSlug!,
		userSession.data as TUser,
	);
	const userLessonActivity =
		new LessonActivityService().getLessonActivityForUser(lessonSlug!, userId);

	return {
		course: {
			name: course?.name ?? '',
			slug: course?.slug ?? '',
		},
		lesson,
		meta,
		module: {
			name: module?.module.name ?? '',
			slug: module?.moduleSlug ?? '',
		},
		userData: userSession.data as TypeUserSession,
		userLessonActivity,
	};
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
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
			await lessonActivityService.togleLessonCompletedForUser(
				lessonSlug!,
				userId,
				completed,
			);
			break;
		}

		case 'save': {
			await lessonActivityService.togleLessonSavedForUser(
				lessonSlug!,
				userId,
				saved,
			);
			break;
		}

		case 'favorite': {
			await lessonActivityService.togleLessonFavoritedForUser(
				lessonSlug!,
				userId,
				favorited,
			);
			break;
		}

		default: {
			break;
		}
	}

	return redirect(`/courses/${courseSlug}/${moduleSlug}/${lessonSlug}`);
};

export default function Lesson() {
	const data = useLoaderData<typeof loader>();
	const { lesson, module, course, userLessonActivity, userData } = data;

	const { ops } = lesson?.lesson.content
		? (JSON.parse(lesson?.lesson.content) as OpIterator)
		: { ops: [] };
	const contentConverter = new QuillDeltaToHtmlConverter(ops, {
		multiLineParagraph: false,
	});

	return (
		lesson && (
			<>
				<NavigateBar userData={userData} />

				<main className="w-full max-w-[95%] sm:max-w-[90%] mx-auto">
					<Breadcrumbs
						data={[
							[`/courses/${course.slug}`, course.name], // Course
							[`/courses/${course.slug}/${module.slug}`, module.name], // Module
							[
								`/courses/${course.slug}/${module.slug}/${lesson.lessonSlug}`,
								lesson.lesson.name,
							], // Lesson
						]}
					/>
					<div className="w-full max-w-(--breakpoint-lg) mx-auto">
						<Suspense fallback={<YemSpinner />}>
							<Await resolve={userLessonActivity}>
								{(userLessonActivity) =>
									userLessonActivity.data.completed !== undefined && (
										<section
											className="flex justify-center gap-5 items-center mb-10"
											id="lesson-activity"
										>
											<Form
												className="flex justify-center gap-3 items-center"
												method="post"
											>
												<input
													className="hidden"
													name="completed"
													readOnly
													type="text"
													value={
														userLessonActivity.data?.completed
															? 'true'
															: 'false'
													}
												/>
												<input
													className="hidden"
													name="saved"
													readOnly
													type="text"
													value={
														userLessonActivity.data?.saved ? 'true' : 'false'
													}
												/>
												<input
													className="hidden"
													name="favorited"
													readOnly
													type="text"
													value={
														userLessonActivity.data?.favorited
															? 'true'
															: 'false'
													}
												/>

												<Tooltip.Provider>
													<Tooltip.Root>
														<Tooltip.Trigger asChild>
															<button
																className="cursor-pointer"
																name="action"
																type="submit"
																value="complete"
															>
																{userLessonActivity.data?.completed ? (
																	<SolidCheckCircleIcon className="size-8 stroke-purple-11 fill-purple-11" />
																) : (
																	<CheckCircleIcon className="size-8" />
																)}
															</button>
														</Tooltip.Trigger>

														<Tooltip.Portal>
															<Tooltip.Content
																className="bg-mauve-5 dark:bg-mauvedark-5 px-4 py-3 rounded-2xl shadow-xs shadow-mauve-8 dark:shadow-mauvedark-8"
																sideOffset={5}
															>
																{userLessonActivity.data?.completed ? (
																	<p>Remover Aula Feita</p>
																) : (
																	<p>Completar Aula</p>
																)}
																<Tooltip.Arrow className="fill-mauve-5 stroke-none" />
															</Tooltip.Content>
														</Tooltip.Portal>
													</Tooltip.Root>
												</Tooltip.Provider>

												<Tooltip.Provider>
													<Tooltip.Root>
														<Tooltip.Trigger asChild>
															<button
																className="cursor-pointer"
																name="action"
																type="submit"
																value="save"
															>
																{userLessonActivity.data?.saved ? (
																	<SolidBookmarkIcon className="size-8 stroke-purple-11 fill-purple-11" />
																) : (
																	<BookmarkIcon className="size-8" />
																)}
															</button>
														</Tooltip.Trigger>

														<Tooltip.Portal>
															<Tooltip.Content
																className="bg-mauve-5 dark:bg-mauvedark-5 px-4 py-3 rounded-2xl shadow-xs shadow-mauve-8 dark:shadow-mauvedark-8"
																sideOffset={5}
															>
																{userLessonActivity.data?.saved ? (
																	<p>Remover Aula Salva</p>
																) : (
																	<p>Salvar Aula</p>
																)}
																<Tooltip.Arrow className="fill-mauve-5 stroke-none" />
															</Tooltip.Content>
														</Tooltip.Portal>
													</Tooltip.Root>
												</Tooltip.Provider>

												<Tooltip.Provider>
													<Tooltip.Root>
														<Tooltip.Trigger asChild>
															<button
																className="cursor-pointer"
																name="action"
																type="submit"
																value="favorite"
															>
																{userLessonActivity.data?.favorited ? (
																	<SolidHeartIcon className="size-8 stroke-purple-11 fill-purple-11" />
																) : (
																	<HeartIcon className="size-8" />
																)}
															</button>
														</Tooltip.Trigger>

														<Tooltip.Portal>
															<Tooltip.Content
																className="bg-mauve-5 dark:bg-mauvedark-5 px-4 py-3 rounded-2xl shadow-xs shadow-mauve-8 dark:shadow-mauvedark-8"
																sideOffset={5}
															>
																{userLessonActivity.data?.favorited ? (
																	<p>Remover Aula Favorita</p>
																) : (
																	<p>Favoritar Aula</p>
																)}
																<Tooltip.Arrow className="fill-mauve-5 stroke-none" />
															</Tooltip.Content>
														</Tooltip.Portal>
													</Tooltip.Root>
												</Tooltip.Provider>
											</Form>
										</section>
									)
								}
							</Await>
						</Suspense>

						{lesson.lesson.videoSourceUrl && (
							<section className="h-fit mb-10 rounded-2xl" id="video">
								{!lesson.lesson.videoSourceUrl.startsWith('https://') && (
									<Stream
										className="pt-[56.25%] relative *:absolute *:w-full *:h-full *:top-0 *:left-0 *:inset-0"
										controls
										preload="auto"
										responsive={false}
										src={lesson.lesson.videoSourceUrl}
									/>
								)}
								{lesson.lesson.videoSourceUrl.startsWith('https://') &&
									!/(youtu.be|youtube)/i.test(lesson.lesson.videoSourceUrl) && (
										<VideoPlayer
											alt={lesson.lesson.name}
											src={lesson.lesson.videoSourceUrl}
											title={lesson.lesson.name}
										/>
									)}
								{/(youtu.be|youtube)/i.test(lesson.lesson.videoSourceUrl) && (
									<iframe
										allowFullScreen
										id="ytplayer"
										src={`${lesson.lesson.videoSourceUrl}${
											lesson.lesson.videoSourceUrl.includes('?') ? '&' : '?'
										}modestbranding=1&rel=0`}
										title={lesson.lesson.name}
									/>
								)}
							</section>
						)}

						{lesson.lesson.content && (
							/* eslint-disable-next-line react/no-danger, @typescript-eslint/naming-convention */
							<section
								className="p-1 sm:p-5 bg-mauvea-2 dark:bg-mauvedarka-2 rounded-2xl flex flex-col gap-6"
								// biome-ignore lint/security/noDangerouslySetInnerHtml: .
								dangerouslySetInnerHTML={{ __html: contentConverter.convert() }}
								id="content"
							/>
						)}
					</div>
				</main>
			</>
		)
	);
}
