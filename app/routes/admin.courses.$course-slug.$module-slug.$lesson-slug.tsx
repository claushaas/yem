/* eslint-disable @typescript-eslint/naming-convention */

import {
	CheckIcon,
	ChevronDownIcon,
	ChevronUpIcon,
	DocumentDuplicateIcon,
	XMarkIcon,
} from '@heroicons/react/24/outline';
import * as Dialog from '@radix-ui/react-dialog';
import * as RadixForm from '@radix-ui/react-form';
import * as RadixSelect from '@radix-ui/react-select';
import copy from 'clipboard-copy';
import { type OpIterator } from 'quill/core';
import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html';
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
import { Editor } from '~/components/text-editor.client.js';
import { YemSpinner } from '~/components/yem-spinner.js';
import { useTextEditor } from '~/hooks/use-text-editor.hook';
import { LessonService } from '~/services/lesson.service.server';
import { TagService } from '~/services/tag.service.server';
import { type TLesson, type TLessonType } from '~/types/lesson.type';
import { type TTag } from '~/types/tag.type';
import { type TUser } from '~/types/user.type';
import { logger } from '~/utils/logger.util';
import { commitUserSession, getUserSession } from '~/utils/session.server';

export const meta = ({ data }: MetaArgs<typeof loader>) => [
	{ title: `Aula ${data!.lesson?.lesson.name} - Yoga em Movimento` },
	{ content: data!.lesson?.lesson.description, name: 'description' },
	{ content: 'noindex, nofollow', name: 'robots' },
	...data!.meta,
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
				`/admin/courses/${courseSlug}/${moduleSlug}/${lessonSlug}`,
				request.url,
			).toString(),
			rel: 'canonical',
			tagName: 'link',
		},
	];

	try {
		const { data: lesson } = await new LessonService().getBySlug(
			courseSlug!,
			moduleSlug!,
			lessonSlug!,
			userSession.data as TUser,
		);
		const { data: tags } = await new TagService().getAll();

		const organizedTags = tags
			.filter((tag) => !lesson?.lesson.tags.map((t) => t.id).includes(tag.id))
			.map((tag) => ({
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

	const {
		'course-slug': courseSlug,
		'module-slug': moduleSlug,
		'lesson-slug': lessonSlug,
	} = useParams();

	const [lessonContent, setLessonContentEditor] = useTextEditor(
		lesson?.lesson.content,
	);
	const [lessonMktContent, setLessonMktContentEditor] = useTextEditor(
		lesson?.lesson.marketingContent,
	);

	const [lessonEditDialogIsOpen, setLessonEditDialogIsOpen] = useState(false);
	const [lessonAddTagsIsOpen, setLessonAddTagsIsOpen] = useState(false);

	const [tagsValue, setTagsValue] = useState<
		Array<{ value: TTag; label: string }>
	>([]);

	const navigation = useNavigation();
	const isSubmittingAnyForm =
		navigation.formAction ===
		`/admin/courses/${courseSlug}/${moduleSlug}/${lessonSlug}`;

	const { ops } = lesson?.lesson.content
		? (JSON.parse(lesson?.lesson.content) as OpIterator)
		: { ops: [] };
	const contentConverter = new QuillDeltaToHtmlConverter(ops, {
		multiLineParagraph: false,
	});

	const defaultDate = new Date(lesson?.publicationDate ?? new Date());
	defaultDate.setHours(defaultDate.getHours() - 3);

	useEffect(() => {
		if (success) {
			setLessonEditDialogIsOpen(false);
		}
	}, [success]);

	const copyToClipboard = async (text: string) => {
		await copy(text);
	};

	return (
		lesson && (
			<>
				<SuccessOrErrorMessage error={error} success={success} />

				<Dialog.Root
					onOpenChange={setLessonEditDialogIsOpen}
					open={lessonEditDialogIsOpen}
				>
					<div className="flex items-center gap-5">
						<h1>{lesson.lesson.name}</h1>
						<Dialog.Trigger asChild>
							<div className="w-fit">
								<Button
									preset={ButtonPreset.Primary}
									text="Editar a Aula"
									type={ButtonType.Button}
								/>
							</div>
						</Dialog.Trigger>
					</div>

					<Dialog.Portal>
						<Dialog.Overlay className="bg-mauvea-12 fixed inset-0" />

						<Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] p-4 max-w-(--breakpoint-lg) w-[90%] bg-mauve-2 dark:bg-mauvedark-2 rounded-xl overflow-y-auto max-h-[90%]">
							<Dialog.Title asChild>
								<h1 className="mb-4">
									{`Editar a Aula ${lesson.lesson.name}`}
								</h1>
							</Dialog.Title>

							<RadixForm.Root asChild>
								<Form
									action={`/admin/courses/${courseSlug}/${moduleSlug}/${lessonSlug}`}
									className="flex flex-col gap-3"
									method="post"
								>
									<RadixForm.Field name="oldId">
										<div className="flex items-baseline justify-between">
											<RadixForm.Label>
												<p>ID da Antiga Plataforma</p>
											</RadixForm.Label>
										</div>
										<RadixForm.Control asChild>
											<input
												className="w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-hidden"
												defaultValue={lesson.lesson.oldId ?? ''}
												disabled={isSubmittingAnyForm}
												min={8}
												type="text"
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<RadixForm.Field name="name">
										<div className="flex items-baseline justify-between">
											<RadixForm.Label>
												<p>Nome</p>
											</RadixForm.Label>
										</div>
										<RadixForm.Control asChild>
											<input
												className="w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-hidden"
												defaultValue={lesson.lesson.name}
												disabled={isSubmittingAnyForm}
												min={8}
												required
												type="text"
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<RadixForm.Field name="description">
										<div className="flex items-baseline justify-between">
											<RadixForm.Label>
												<p>Descrição</p>
											</RadixForm.Label>
										</div>
										<RadixForm.Control asChild>
											<input
												className="w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-hidden"
												defaultValue={lesson.lesson.description ?? ''}
												disabled={isSubmittingAnyForm}
												min={8}
												required
												type="text"
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<RadixForm.Field name="type">
										<div className="flex items-baseline justify-between">
											<RadixForm.Label>
												<p>Tipo da aula</p>
											</RadixForm.Label>
										</div>
										<RadixSelect.Root
											defaultValue={lesson.lesson.type}
											name="type"
										>
											<RadixSelect.Trigger
												aria-label="Tipo da aula"
												className="inline-flex items-center justify-center rounded-sm px-[15px] text-[13px] leading-none h-[35px] gap-[5px] bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 shadow-[0_2px_10px] shadow-black/10 hover:bg-mauve3 focus:shadow-[0_0_0_2px] focus:shadow-black data-placeholder:text-violet9 outline-hidden"
											>
												<RadixSelect.Value placeholder="Escolha o tipo da aula" />
												<RadixSelect.Icon>
													<ChevronDownIcon className="size-4" />
												</RadixSelect.Icon>
											</RadixSelect.Trigger>

											<RadixSelect.Portal>
												<RadixSelect.Content className="overflow-hidden bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 rounded-md shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)]">
													<RadixSelect.ScrollUpButton>
														<ChevronUpIcon className="size-4" />
													</RadixSelect.ScrollUpButton>

													<RadixSelect.Viewport className="p-[5px]">
														<RadixSelect.Group>
															<RadixSelect.SelectItem
																className="text-[13px] leading-none text-violet11 rounded-[3px] flex items-center h-[25px] pr-[35px] pl-[25px] relative select-none data-disabled:text-mauve8 data-disabled:pointer-events-none data-highlighted:outline-hidden data-highlighted:bg-violet9 data-highlighted:text-violet1"
																value="video"
															>
																<RadixSelect.SelectItemText>
																	<p>Vídeo</p>
																</RadixSelect.SelectItemText>
																<RadixSelect.ItemIndicator className="absolute left-0 w-[25px] inline-flex items-center justify-center">
																	<CheckIcon />
																</RadixSelect.ItemIndicator>
															</RadixSelect.SelectItem>

															<RadixSelect.SelectItem
																className="text-[13px] leading-none text-violet11 rounded-[3px] flex items-center h-[25px] pr-[35px] pl-[25px] relative select-none data-disabled:text-mauve8 data-disabled:pointer-events-none data-highlighted:outline-hidden data-highlighted:bg-violet9 data-highlighted:text-violet1"
																value="text"
															>
																<RadixSelect.SelectItemText>
																	<p>Texto</p>
																</RadixSelect.SelectItemText>
																<RadixSelect.ItemIndicator className="absolute left-0 w-[25px] inline-flex items-center justify-center">
																	<CheckIcon />
																</RadixSelect.ItemIndicator>
															</RadixSelect.SelectItem>

															<RadixSelect.SelectItem
																className="text-[13px] leading-none text-violet11 rounded-[3px] flex items-center h-[25px] pr-[35px] pl-[25px] relative select-none data-disabled:text-mauve8 data-disabled:pointer-events-none data-highlighted:outline-hidden data-highlighted:bg-violet9 data-highlighted:text-violet1"
																value="courseWare"
															>
																<RadixSelect.SelectItemText>
																	<p>Material Didático</p>
																</RadixSelect.SelectItemText>
																<RadixSelect.ItemIndicator className="absolute left-0 w-[25px] inline-flex items-center justify-center">
																	<CheckIcon />
																</RadixSelect.ItemIndicator>
															</RadixSelect.SelectItem>
														</RadixSelect.Group>
													</RadixSelect.Viewport>

													<RadixSelect.ScrollDownButton>
														<ChevronDownIcon className="size-4" />
													</RadixSelect.ScrollDownButton>
												</RadixSelect.Content>
											</RadixSelect.Portal>
										</RadixSelect.Root>
									</RadixForm.Field>

									<RadixForm.Field name="content">
										<div className="flex items-baseline justify-between">
											<RadixForm.Label>
												<p>Conteúdo</p>
											</RadixForm.Label>
										</div>
										<RadixForm.Control asChild>
											<input
												className="hidden"
												disabled={isSubmittingAnyForm}
												min={8}
												type="text"
												value={lessonContent}
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<Editor
										placeholder="Adicione aqui o conteúdo da aula, que só aparece para os alunos..."
										setQuill={setLessonContentEditor}
									/>

									<RadixForm.Field name="marketingContent">
										<div className="flex items-baseline justify-between">
											<RadixForm.Label>
												<p>Conteúdo de Divulgação</p>
											</RadixForm.Label>
										</div>
										<RadixForm.Control asChild>
											<input
												className="hidden"
												disabled={isSubmittingAnyForm}
												min={8}
												type="text"
												value={lessonMktContent}
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<Editor
										placeholder="Adicione aqui o conteúdo de divulgação da aula, que só aparece para quem não é aluno..."
										setQuill={setLessonMktContentEditor}
									/>

									<RadixForm.Field name="videoSourceUrl">
										<div className="flex items-baseline justify-between">
											<RadixForm.Label>
												<p>Vídeo</p>
											</RadixForm.Label>
										</div>
										<RadixForm.Control asChild>
											<input
												className="w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-hidden"
												defaultValue={lesson.lesson.videoSourceUrl ?? ''}
												disabled={isSubmittingAnyForm}
												min={3}
												type="text"
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<RadixForm.Field name="marketingVideoUrl">
										<div className="flex items-baseline justify-between">
											<RadixForm.Label>
												<p>Vídeo de Divulgação</p>
											</RadixForm.Label>
										</div>
										<RadixForm.Control asChild>
											<input
												className="w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-hidden"
												defaultValue={lesson.lesson.marketingVideoUrl ?? ''}
												disabled={isSubmittingAnyForm}
												min={3}
												type="text"
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<RadixForm.Field name="duration">
										<div className="flex items-baseline justify-between">
											<RadixForm.Label>
												<p>Duração do vídeo (em minutos)</p>
											</RadixForm.Label>
										</div>
										<RadixForm.Control asChild>
											<input
												className="w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-hidden"
												defaultValue={Number(lesson.lesson.duration)}
												disabled={isSubmittingAnyForm}
												type="number"
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<RadixForm.Field name="thumbnailUrl">
										<div className="flex items-baseline justify-between">
											<RadixForm.Label>
												<p>Imagem de capa</p>
											</RadixForm.Label>
										</div>
										<RadixForm.Control asChild>
											<input
												className="w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-hidden"
												defaultValue={lesson.lesson.thumbnailUrl}
												disabled={isSubmittingAnyForm}
												min={3}
												required
												type="text"
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<RadixForm.Field className="hidden" name="id">
										<RadixForm.Control asChild>
											<input
												disabled={isSubmittingAnyForm}
												type="text"
												value={lesson.lesson.id}
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<RadixForm.Field className="hidden" name="formType">
										<RadixForm.Control asChild>
											<input
												disabled={isSubmittingAnyForm}
												type="text"
												value="updateLesson"
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<RadixForm.Submit asChild>
										<Button
											className="m-auto mt-2"
											isDisabled={isSubmittingAnyForm}
											preset={ButtonPreset.Primary}
											text="Editar a Aula"
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

				<div>
					<h4>{lesson.lesson.description}</h4>
					<p>
						Data de publicação:{' '}
						{new Date(lesson.publicationDate).toLocaleString('pt-BR')}
					</p>
					<p>Está publicado: {lesson.isPublished ? 'sim' : 'não'}</p>
					{lesson.lesson.videoSourceUrl && (
						<div className="flex gap-5">
							<p>Link HLS: {lesson.lesson.videoSourceUrl}</p>
							<p>
								<DocumentDuplicateIcon
									className="size-5 cursor-pointer"
									onClick={async () =>
										copyToClipboard(lesson.lesson.videoSourceUrl ?? '')
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
											{`Adicionar tags à Aula ${lesson.lesson.name}`}
										</h1>
									</Dialog.Title>

									<RadixForm.Root asChild>
										<Form
											action={`/admin/courses/${courseSlug}/${moduleSlug}/${lessonSlug}`}
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
														value={lesson.lesson.id}
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

					{lesson.lesson.tags.length > 0 &&
						lesson.lesson.tags.map((tag) => (
							<div className="flex items-center gap-5" key={tag.id}>
								<p>
									{tag.tagOptionName} - {tag.tagValueName}
								</p>

								<RadixForm.Root asChild>
									<Form
										action={`/admin/courses/${courseSlug}/${moduleSlug}/${lessonSlug}`}
										method="post"
									>
										<RadixForm.Field name="formType">
											<RadixForm.Control asChild>
												<input
													className="hidden"
													disabled={isSubmittingAnyForm}
													type="text"
													value="removeTag"
												/>
											</RadixForm.Control>
										</RadixForm.Field>

										<RadixForm.Field name="lessonId">
											<RadixForm.Control asChild>
												<input
													className="hidden"
													disabled={isSubmittingAnyForm}
													type="text"
													value={lesson.lesson.id}
												/>
											</RadixForm.Control>
										</RadixForm.Field>

										<RadixForm.Field name="tagId">
											<RadixForm.Control asChild>
												<input
													className="hidden"
													disabled={isSubmittingAnyForm}
													type="text"
													value={tag.id}
												/>
											</RadixForm.Control>
										</RadixForm.Field>

										<RadixForm.Submit asChild>
											<Button
												className="m-auto mt-2"
												isDisabled={isSubmittingAnyForm}
												preset={ButtonPreset.Primary}
												text="Remover Tag"
												type={ButtonType.Submit}
											/>
										</RadixForm.Submit>
									</Form>
								</RadixForm.Root>
							</div>
						))}

					{lesson.lesson.content && (
						<>
							<h2>Conteúdo da Aula:</h2>
							{/* eslint-disable-next-line react/no-danger */}
							<div
								className="p-4 rounded-lg border-2 border-mauve-6 dark:border-mauvedark-6 max-w-(--breakpoint-lg)"
								dangerouslySetInnerHTML={{ __html: contentConverter.convert() }}
							/>
						</>
					)}
				</div>
			</>
		)
	);
}
