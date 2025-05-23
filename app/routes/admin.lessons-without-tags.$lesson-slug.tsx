/* eslint-disable @typescript-eslint/naming-convention */

import { DocumentDuplicateIcon, XMarkIcon } from '@heroicons/react/24/outline';
import * as Dialog from '@radix-ui/react-dialog';
import * as RadixForm from '@radix-ui/react-form';
import copy from 'clipboard-copy';
import { useEffect, useState } from 'react';
import {
	type ActionFunctionArgs,
	data,
	Form,
	type LoaderFunctionArgs,
	type MetaArgs,
	useLoaderData,
	useNavigation,
	useParams,
} from 'react-router';
import Select from 'react-select';
import { SuccessOrErrorMessage } from '~/components/admin-success-or-error-message.js';
import { Button, ButtonPreset, ButtonType } from '~/components/button.js';
import { YemSpinner } from '~/components/yem-spinner.js';
import { LessonService } from '~/services/lesson.service.server';
import { TagService } from '~/services/tag.service.server';
import { type TLesson, type TLessonType } from '~/types/lesson.type';
import { type TTag } from '~/types/tag.type';
import { type TUser } from '~/types/user.type';
import { logger } from '~/utils/logger.util';
import { commitUserSession, getUserSession } from '~/utils/session.server';

export const meta = ({ data }: MetaArgs<typeof loader>) => [
	{ title: `Aula ${data!.lesson?.name} - Yoga em Movimento` },
	{ content: data!.lesson?.description, name: 'description' },
	{ content: 'noindex, nofollow', name: 'robots' },
	...data!.meta,
];

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));
	const { 'lesson-slug': lessonSlug } = params;

	const meta = [
		{
			href: new URL(
				`/admin/lessons-without-tags/${lessonSlug}`,
				request.url,
			).toString(),
			rel: 'canonical',
			tagName: 'link',
		},
	];

	try {
		const { data: lesson } = await new LessonService().getByLessonSlugOnly(
			lessonSlug!,
			userSession.data as TUser,
		);
		const { data: tags } = await new TagService().getAll();

		const organizedTags = tags.map((tag) => ({
			label: `${tag.tagOptionName}: ${tag.tagValueName}`,
			value: [tag.tagOptionName, tag.tagValueName],
		})) as Array<{ value: TTag; label: string }>;

		return data(
			{
				error: userSession.get('error') as string | undefined,
				lesson,
				meta,
				success: userSession.get('success') as string | undefined,
				tags: organizedTags,
			},
			{
				headers: {
					'Set-Cookie': await commitUserSession(userSession),
				},
			},
		);
	} catch (error) {
		logger.logError(`Error fetching lesson: ${(error as Error).message}`);

		return data(
			{
				error: `Error fetching lesson: ${(error as Error).message}`,
				lesson: undefined,
				meta,
				success: undefined,
				tags: undefined,
			},
			{
				headers: {
					'Set-Cookie': await commitUserSession(userSession),
				},
			},
		);
	}
};

export const action = async ({ request }: ActionFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));

	if ((userSession.get('roles') as string[])?.includes('admin')) {
		try {
			const formData = await request.formData();

			const lessonService = new LessonService();

			const id = formData.get('id') as string;

			switch (formData.get('formType')) {
				case 'addTags': {
					const tagsToAdd = JSON.parse(
						formData.get('tags') as string,
					) as TTag[];

					await lessonService.addTagsToLesson(id, tagsToAdd);

					userSession.flash('success', 'Tags adicionadas com sucesso');
					break;
				}

				case 'updateLesson': {
					const lessonToUpdate: TLesson = {
						content: formData.get('content') as string,
						description: formData.get('description') as string,
						duration: Number(formData.get('duration')),
						marketingContent: formData.get('marketingContent') as string,
						marketingVideoUrl: formData.get('marketingVideoUrl') as string,
						name: formData.get('name') as string,
						oldId: formData.get('oldId') as string,
						thumbnailUrl: formData.get('thumbnailUrl') as string,
						type: formData.get('type') as TLessonType,
						videoSourceUrl: formData.get('videoSourceUrl') as string,
					};

					await lessonService.update(id, lessonToUpdate);

					userSession.flash(
						'success',
						`Aula ${lessonToUpdate.name} atualizada com sucesso!`,
					);
					break;
				}

				case 'removeTag': {
					const lessonId = formData.get('lessonId') as string;
					const tagId = formData.get('tagId') as string;

					await lessonService.removeTagFromLesson(lessonId, tagId);

					userSession.flash('success', 'Tag removida com sucesso');
					break;
				}

				default: {
					throw new Error('Invalid form type');
				}
			}
		} catch (error) {
			logger.logError(`Error updating lesson: ${(error as Error).message}`);
			userSession.flash('error', (error as Error).message);
		}
	} else {
		userSession.flash(
			'error',
			'Você não tem permissão para realizar esta ação',
		);
	}

	return data(
		{},
		{ headers: { 'Set-Cookie': await commitUserSession(userSession) } },
	);
};

export default function Lesson() {
	const { error, success, lesson, tags } = useLoaderData<typeof loader>();

	const { 'lesson-slug': lessonSlug } = useParams();

	const [lessonAddTagsIsOpen, setLessonAddTagsIsOpen] = useState(false);

	const [tagsValue, setTagsValue] = useState<
		Array<{ value: TTag; label: string }>
	>([]);

	const navigation = useNavigation();
	const isSubmittingAnyForm =
		navigation.formAction === `/admin/lessons-without-tags/${lessonSlug}`;

	useEffect(() => {
		if (success) {
			setLessonAddTagsIsOpen(false);
		}
	}, [success]);

	const copyToClipboard = async (text: string) => {
		await copy(text);
	};

	return (
		lesson && (
			<>
				<SuccessOrErrorMessage error={error} success={success} />

				<div>
					<h4>{lesson.description}</h4>
					{lesson.videoSourceUrl && (
						<div className="flex gap-5">
							<p>Link HLS: {lesson.videoSourceUrl}</p>
							<p>
								<DocumentDuplicateIcon
									className="size-5 cursor-pointer"
									onClick={async () =>
										copyToClipboard(lesson.videoSourceUrl ?? '')
									}
								/>
							</p>
						</div>
					)}

					<div className="flex items-center gap-5 mt-5">
						<h4>Tags:</h4>

						<Dialog.Root
							onOpenChange={setLessonAddTagsIsOpen}
							open={lessonAddTagsIsOpen}
						>
							<Dialog.Trigger asChild>
								<div className="w-fit">
									<Button
										preset={ButtonPreset.Primary}
										text="Adicionar Tags"
										type={ButtonType.Button}
									/>
								</div>
							</Dialog.Trigger>

							<Dialog.Portal>
								<Dialog.Overlay className="bg-mauvea-12 fixed inset-0" />

								<Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] p-4 max-w-(--breakpoint-lg) w-[90%] bg-mauve-2 dark:bg-mauvedark-2 rounded-xl overflow-y-auto max-h-[90%] min-h-[50%]">
									<Dialog.Title asChild>
										<h1 className="mb-4">
											{`Adicionar tags à Aula ${lesson.name}`}
										</h1>
									</Dialog.Title>

									<RadixForm.Root asChild>
										<Form
											action={`/admin/lessons-without-tags/${lessonSlug}`}
											className="flex flex-col gap-3"
											method="post"
										>
											<RadixForm.Field name="tags">
												<div className="flex items-baseline justify-between">
													<RadixForm.Label>
														<p>Tags</p>
													</RadixForm.Label>
												</div>
												<RadixForm.Control asChild>
													<input
														className="hidden"
														disabled={isSubmittingAnyForm}
														type="text"
														value={JSON.stringify(
															tagsValue.map((tag) => tag.value),
														)}
													/>
												</RadixForm.Control>
												<Select
													isMulti
													onChange={(selectedOption) => {
														setTagsValue(
															selectedOption as Array<{
																value: TTag;
																label: string;
															}>,
														);
													}}
													options={tags}
													value={tagsValue}
												/>
											</RadixForm.Field>

											<RadixForm.Field className="hidden" name="id">
												<RadixForm.Control asChild>
													<input
														disabled={isSubmittingAnyForm}
														type="text"
														value={lesson.id}
													/>
												</RadixForm.Control>
											</RadixForm.Field>

											<RadixForm.Field className="hidden" name="formType">
												<RadixForm.Control asChild>
													<input
														disabled={isSubmittingAnyForm}
														type="text"
														value="addTags"
													/>
												</RadixForm.Control>
											</RadixForm.Field>

											<RadixForm.Submit asChild>
												<Button
													className="m-auto mt-2"
													isDisabled={isSubmittingAnyForm}
													preset={ButtonPreset.Primary}
													text="Adicionar Tags"
													type={ButtonType.Submit}
												/>
											</RadixForm.Submit>

											{isSubmittingAnyForm && <YemSpinner />}
										</Form>
									</RadixForm.Root>

									<Dialog.Close asChild>
										<button
											aria-label="Close"
											className="absolute top-[10px] right-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center outline-hidden"
											type="button"
										>
											<XMarkIcon
												aria-label="Close"
												className="hover:pointer absolute top-[10px] right-[10px] inline-flex h-[25px] w-[25px]"
											/>
										</button>
									</Dialog.Close>
								</Dialog.Content>
							</Dialog.Portal>
						</Dialog.Root>
					</div>
				</div>
			</>
		)
	);
}
