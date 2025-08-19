/** biome-ignore-all lint/style/noNonNullAssertion: . */
import {
	CheckIcon,
	ChevronDownIcon,
	ChevronUpIcon,
	XMarkIcon,
} from '@heroicons/react/24/outline';
import * as Dialog from '@radix-ui/react-dialog';
import * as RadixForm from '@radix-ui/react-form';
import * as RadixSelect from '@radix-ui/react-select';
import * as Switch from '@radix-ui/react-switch';
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
import { ContentConverter } from '~/components/content-converter.js';
import { AdminEntityCard } from '~/components/entities-cards.js';
import { Editor } from '~/components/text-editor.client.js';
import { YemSpinner } from '~/components/yem-spinner.js';
import { useTextEditor } from '~/hooks/use-text-editor.hook.js';
import { LessonService } from '~/services/lesson.service.server';
import { ModuleService } from '~/services/module.service.server';
import { TagService } from '~/services/tag.service.server';
import type { TLesson, TLessonType } from '~/types/lesson.type';
import type { TModule } from '~/types/module.type';
import type { TTag, TTags } from '~/types/tag.type';
import type { TUser } from '~/types/user.type';
import { logger } from '~/utils/logger.util';
import { commitUserSession, getUserSession } from '~/utils/session.server';

export const meta = ({ data }: MetaArgs<typeof loader>) => [
	{ title: `${data?.module?.module.name} - Yoga em Movimento` },
	{ content: data?.module?.module.description, name: 'description' },
	{ content: 'noindex, nofollow', name: 'robots' },
	...data!.meta,
];

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));
	const { 'course-slug': courseSlug, 'module-slug': moduleSlug } = params;

	const meta = [
		{
			href: new URL(
				`/admin/courses/${courseSlug}/${moduleSlug}`,
				request.url,
			).toString(),
			rel: 'canonical',
			tagName: 'link',
		},
	];

	const moduleService = new ModuleService();

	try {
		const { data: module } = await moduleService.getBySlug(
			courseSlug!,
			moduleSlug!,
			userSession.data as TUser,
		);
		const { data: tags } = await new TagService().getAll();
		const { data: allLessons } = await new LessonService().getAll(
			userSession.data as TUser,
		);

		const possibleLessons = allLessons
			.filter(
				(lesson) =>
					!module?.module.lessons
						.map((moduleLesson) => moduleLesson.lessonSlug)
						.includes(lesson.slug),
			)
			.map((lesson) => ({ label: lesson.name, value: lesson.slug }));

		const organizedTags = tags.map((tag) => ({
			label: `${tag.tagOptionName}: ${tag.tagValueName}`,
			value: [tag.tagOptionName, tag.tagValueName],
		})) as Array<{ value: TTag; label: string }>;

		return data(
			{
				allLessons: possibleLessons,
				error: userSession.get('error') as string | undefined,
				meta,
				module,
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
		logger.logError(`Error getting module: ${(error as Error).message}`);
		return data(
			{
				allLessons: undefined,
				error: (error as Error).message,
				meta,
				module: undefined,
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

	try {
		if ((userSession.get('roles') as string[])?.includes('admin')) {
			const formData = await request.formData();

			switch (formData.get('formType')) {
				case 'editModule': {
					const id = formData.get('id') as string;

					const moduleToUpdate: TModule = {
						content: formData.get('content') as string,
						description: formData.get('description') as string,
						isLessonsOrderRandom: Boolean(formData.get('isLessonsOrderRandom')),
						marketingContent: formData.get('marketingContent') as string,
						marketingVideoUrl: formData.get('marketingVideoUrl') as string,
						name: formData.get('name') as string,
						oldId: formData.get('oldId') as string,
						showTagsFilters: Boolean(formData.get('showTagsFilters')),
						thumbnailUrl: formData.get('thumbnailUrl') as string,
						videoSourceUrl: formData.get('videoSourceUrl') as string,
					};

					await new ModuleService().update(id, moduleToUpdate);

					userSession.flash(
						'success',
						`Módulo ${moduleToUpdate.name} atualizado com sucesso`,
					);
					break;
				}

				case 'newLesson': {
					const newLesson: TLesson = {
						content: formData.get('content') as string,
						description: formData.get('description') as string,
						duration: Number(formData.get('duration')),
						isPublished: Boolean(formData.get('isPublished')),
						marketingContent: formData.get('marketingContent') as string,
						marketingVideoUrl: formData.get('marketingVideoUrl') as string,
						modules: (formData.get('modules') as string).split(','),
						name: formData.get('name') as string,
						oldId: formData.get('oldId') as string,
						order: Number(formData.get('order')),
						publicationDate: new Date(
							formData.get('publicationDate') as string,
						),
						tags: JSON.parse(formData.get('tags') as string) as TTags,
						thumbnailUrl: formData.get('thumbnailUrl') as string,
						type: formData.get('type') as TLessonType,
						videoSourceUrl: formData.get('videoSourceUrl') as string,
					};

					await new LessonService().create(newLesson);

					userSession.flash(
						'success',
						`Nova aula ${newLesson.name} criada com sucesso`,
					);
					break;
				}

				case 'existingLesson': {
					const lessonSlug = formData.get('lessonSlug') as string;
					const moduleSlug = formData.get('moduleSlug') as string;
					const publicationDate = new Date(
						formData.get('publicationDate') as string,
					);
					const isPublished = Boolean(formData.get('isPublished') === 'on');
					const order = Number(formData.get('order'));

					await new LessonService().associateLessonWithModule(
						lessonSlug,
						moduleSlug,
						publicationDate,
						isPublished,
						order,
					);

					userSession.flash('success', 'Aula associada com sucesso');
					break;
				}

				default: {
					userSession.flash('error', 'Formulário inválido');
					break;
				}
			}
		} else {
			userSession.flash('error', 'Você não tem permissão');
		}
	} catch (error) {
		logger.logError(`Error: ${(error as Error).message}`);
		userSession.flash('error', (error as Error).message);
	}

	return data(
		{},
		{ headers: { 'Set-Cookie': await commitUserSession(userSession) } },
	);
};

export default function Module() {
	const { allLessons, module, tags, error, success } =
		useLoaderData<typeof loader>();

	const { 'course-slug': courseSlug, 'module-slug': moduleSlug } = useParams();

	const [moduleContent, setModuleContentEditor] = useTextEditor(
		module?.module.content,
	);
	const [moduleMktContent, setModuleMktContentEditor] = useTextEditor(
		module?.module.marketingContent,
	);
	const [lessonContent, setLessonContentEditor] = useTextEditor();
	const [lessonMktContent, setLessonMktContentEditor] = useTextEditor();

	const [moduleEditDialogIsOpen, setModuleEditDialogIsOpen] = useState(false);
	const [newLessonDialogIsOpen, setNewLessonDialogIsOpen] = useState(false);
	const [existingLessonDialogIsOpen, setExistingLessonDialogIsOpen] =
		useState(false);

	const [tagsValue, setTagsValue] = useState<
		Array<{ value: TTag; label: string }>
	>([]);
	const [lessonsValue, setLessonsValue] = useState<{
		value: string;
		label: string;
	}>();

	const navigation = useNavigation();
	const isSubmittingAnyForm =
		navigation.formAction === `/admin/courses/${courseSlug}/${moduleSlug}`;

	const defaultDate = new Date(module?.publicationDate ?? new Date());
	defaultDate.setHours(defaultDate.getHours() - 3);

	useEffect(() => {
		if (success) {
			setModuleEditDialogIsOpen(false);
			setNewLessonDialogIsOpen(false);
			setExistingLessonDialogIsOpen(false);
		}
	}, [success]);

	return (
		module && (
			<>
				<SuccessOrErrorMessage error={error} success={success} />

				<Dialog.Root
					onOpenChange={setModuleEditDialogIsOpen}
					open={moduleEditDialogIsOpen}
				>
					<div className="flex items-center gap-5">
						<h1>{module.module.name}</h1>
						<Dialog.Trigger asChild>
							<div className="w-fit">
								<Button
									preset={ButtonPreset.Primary}
									text="Editar o Módulo"
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
									{`Editar o Módulo ${module.module.name}`}
								</h1>
							</Dialog.Title>

							<RadixForm.Root asChild>
								<Form
									action={`/admin/courses/${courseSlug}/${moduleSlug}`}
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
												defaultValue={module.module.oldId ?? ''}
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
												defaultValue={module.module.name}
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
												defaultValue={module.module.description ?? ''}
												disabled={isSubmittingAnyForm}
												min={8}
												required
												type="text"
											/>
										</RadixForm.Control>
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
												value={moduleContent}
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<Editor
										placeholder="Adicione aqui o conteúdo do módulo, que só aparece para os alunos..."
										setQuill={setModuleContentEditor}
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
												value={moduleMktContent}
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<Editor
										placeholder="Adicione aqui o conteúdo de divulgação do módulo, que aparece para quem não é aluno..."
										setQuill={setModuleMktContentEditor}
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
												defaultValue={module.module.videoSourceUrl ?? ''}
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
												defaultValue={module.module.marketingVideoUrl ?? ''}
												disabled={isSubmittingAnyForm}
												min={3}
												type="text"
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
												defaultValue={module.module.thumbnailUrl}
												disabled={isSubmittingAnyForm}
												min={3}
												required
												type="text"
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<RadixForm.Field name="isLessonsOrderRandom">
										<div className="flex items-baseline justify-between">
											<RadixForm.Label>
												<p>As aulas deste módulo devem ser embaralhadas?</p>
											</RadixForm.Label>
										</div>
										<RadixForm.Control asChild>
											<Switch.Root
												className="w-[42px] h-[25px] bg-blacka-6 rounded-full relative shadow-[0_2px_10px] shadow-blacka-4 focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-black outline-hidden cursor-default"
												defaultChecked={module.module.isLessonsOrderRandom}
												disabled={isSubmittingAnyForm}
											>
												<Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full shadow-[0_2px_2px] shadow-blackA4 transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px]" />
											</Switch.Root>
										</RadixForm.Control>
									</RadixForm.Field>

									<RadixForm.Field name="showTagsFilters">
										<div className="flex items-baseline justify-between">
											<RadixForm.Label>
												<p>Mostrar os filtros de tags?</p>
											</RadixForm.Label>
										</div>
										<RadixForm.Control asChild>
											<Switch.Root
												className="w-[42px] h-[25px] bg-blacka-6 rounded-full relative shadow-[0_2px_10px] shadow-blacka-4 focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-black outline-hidden cursor-default"
												defaultChecked={module.module.showTagsFilters}
												disabled={isSubmittingAnyForm}
											>
												<Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full shadow-[0_2px_2px] shadow-blackA4 transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px]" />
											</Switch.Root>
										</RadixForm.Control>
									</RadixForm.Field>

									<RadixForm.Field className="hidden" name="formType">
										<RadixForm.Control asChild>
											<input
												disabled={isSubmittingAnyForm}
												type="text"
												value="editModule"
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<RadixForm.Field className="hidden" name="id">
										<RadixForm.Control asChild>
											<input
												disabled={isSubmittingAnyForm}
												type="text"
												value={module.module.id}
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<RadixForm.Submit asChild>
										<Button
											className="m-auto mt-2"
											isDisabled={isSubmittingAnyForm}
											preset={ButtonPreset.Primary}
											text="Editar o Módulo"
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
					<h4>{module.module.description}</h4>
					<p>
						Data de publicação:{' '}
						{new Date(module.publicationDate).toLocaleString('pt-BR')}
					</p>
					<p>Está publicado: {module.isPublished ? 'sim' : 'não'}</p>
					{module.module.content && (
						<>
							<h2>Conteúdo do Módulo:</h2>
							<ContentConverter
								className="p-4 rounded-lg border-2 border-mauve-6 dark:border-mauvedark-6 max-w-(--breakpoint-lg)"
								content={module.module.content}
							/>
						</>
					)}
				</div>

				<div>
					<div className="flex items-center gap-5">
						<h2>Aulas</h2>

						<Dialog.Root
							onOpenChange={setNewLessonDialogIsOpen}
							open={newLessonDialogIsOpen}
						>
							<Dialog.Trigger asChild>
								<div className="w-fit">
									<Button
										preset={ButtonPreset.Primary}
										text="Adicionar Nova Aula"
										type={ButtonType.Button}
									/>
								</div>
							</Dialog.Trigger>

							<Dialog.Portal>
								<Dialog.Overlay className="bg-mauvea-12 fixed inset-0" />

								<Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] p-4 max-w-(--breakpoint-lg) w-[90%] bg-mauve-2 dark:bg-mauvedark-2 rounded-xl overflow-y-auto max-h-[90%]">
									<Dialog.Title asChild>
										<h1 className="mb-4">Adicionar Nova Aula</h1>
									</Dialog.Title>

									<RadixForm.Root asChild>
										<Form
											action={`/admin/courses/${courseSlug}/${moduleSlug}`}
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
												<RadixSelect.Root name="type">
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
												placeholder="Adicione aqui o conteúdo de divulgação da aula, que aparece para quem não é aluno..."
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
														disabled={isSubmittingAnyForm}
														min={3}
														required
														type="text"
													/>
												</RadixForm.Control>
											</RadixForm.Field>

											<RadixForm.Field name="modules">
												<RadixForm.Control asChild>
													<input
														className="hidden"
														disabled={isSubmittingAnyForm}
														type="text"
														value={module.module.slug}
													/>
												</RadixForm.Control>
											</RadixForm.Field>

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

											<RadixForm.Field className="hidden" name="formType">
												<RadixForm.Control asChild>
													<input
														disabled={isSubmittingAnyForm}
														type="text"
														value="newLesson"
													/>
												</RadixForm.Control>
											</RadixForm.Field>

											<RadixForm.Field name="publicationDate">
												<div className="flex items-baseline justify-between">
													<RadixForm.Label>
														<p>Data de publicação</p>
													</RadixForm.Label>
												</div>
												<RadixForm.Control asChild>
													<input
														className="w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-hidden"
														defaultValue={defaultDate
															.toISOString()
															.slice(0, 16)}
														disabled={isSubmittingAnyForm}
														min={3}
														type="datetime-local"
													/>
												</RadixForm.Control>
											</RadixForm.Field>

											<RadixForm.Field name="isPublished">
												<div className="flex items-baseline justify-between">
													<RadixForm.Label>
														<p>Está publicada</p>
													</RadixForm.Label>
												</div>
												<RadixForm.Control asChild>
													<Switch.Root
														className="w-[42px] h-[25px] bg-blacka-6 rounded-full relative shadow-[0_2px_10px] shadow-blacka-4 focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-black outline-hidden cursor-default"
														disabled={isSubmittingAnyForm}
													>
														<Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full shadow-[0_2px_2px] shadow-blackA4 transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px]" />
													</Switch.Root>
												</RadixForm.Control>
											</RadixForm.Field>

											<RadixForm.Field name="order">
												<div className="flex items-baseline justify-between">
													<RadixForm.Label>
														<p>Posição da aula dentro do módulo</p>
													</RadixForm.Label>
												</div>
												<RadixForm.Control asChild>
													<input
														className="w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-hidden"
														disabled={isSubmittingAnyForm}
														required
														type="text"
													/>
												</RadixForm.Control>
											</RadixForm.Field>

											<RadixForm.Submit asChild>
												<Button
													className="m-auto mt-2"
													isDisabled={isSubmittingAnyForm}
													preset={ButtonPreset.Primary}
													text="Criar Nova Aula"
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

						<Dialog.Root
							onOpenChange={setExistingLessonDialogIsOpen}
							open={existingLessonDialogIsOpen}
						>
							<Dialog.Trigger asChild>
								<div className="w-fit">
									<Button
										preset={ButtonPreset.Primary}
										text="Adicionar Aula Existente"
										type={ButtonType.Button}
									/>
								</div>
							</Dialog.Trigger>

							<Dialog.Portal>
								<Dialog.Overlay className="bg-mauvea-12 fixed inset-0" />

								<Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] p-4 max-w-(--breakpoint-lg) w-[90%] bg-mauve-2 dark:bg-mauvedark-2 rounded-xl overflow-y-auto max-h-[90%]">
									<Dialog.Title asChild>
										<h1 className="mb-4">Adicionar Aula Existente</h1>
									</Dialog.Title>

									<RadixForm.Root asChild>
										<Form
											action={`/admin/courses/${courseSlug}/${moduleSlug}`}
											className="flex flex-col gap-3"
											method="post"
										>
											<RadixForm.Field name="lessonSlug">
												<div className="flex items-baseline justify-between">
													<RadixForm.Label>
														<p>Selecionar aula</p>
													</RadixForm.Label>
												</div>
												<RadixForm.Control asChild>
													<input
														className="hidden"
														disabled={isSubmittingAnyForm}
														type="text"
														value={lessonsValue?.value}
													/>
												</RadixForm.Control>
												<Select
													onChange={(selectedOption) => {
														setLessonsValue(
															selectedOption as {
																value: string;
																label: string;
															},
														);
													}}
													options={allLessons}
													value={lessonsValue}
												/>
											</RadixForm.Field>

											<RadixForm.Field name="publicationDate">
												<div className="flex items-baseline justify-between">
													<RadixForm.Label>
														<p>Data de publicação</p>
													</RadixForm.Label>
												</div>
												<RadixForm.Control asChild>
													<input
														className="w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-hidden"
														defaultValue={defaultDate
															.toISOString()
															.slice(0, 16)}
														disabled={isSubmittingAnyForm}
														min={3}
														type="datetime-local"
													/>
												</RadixForm.Control>
											</RadixForm.Field>

											<RadixForm.Field name="isPublished">
												<div className="flex items-baseline justify-between">
													<RadixForm.Label>
														<p>Está publicada</p>
													</RadixForm.Label>
												</div>
												<RadixForm.Control asChild>
													<Switch.Root
														className="w-[42px] h-[25px] bg-blacka-6 rounded-full relative shadow-[0_2px_10px] shadow-blacka-4 focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-black outline-hidden cursor-default"
														disabled={isSubmittingAnyForm}
													>
														<Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full shadow-[0_2px_2px] shadow-blackA4 transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px]" />
													</Switch.Root>
												</RadixForm.Control>
											</RadixForm.Field>

											<RadixForm.Field name="order">
												<div className="flex items-baseline justify-between">
													<RadixForm.Label>
														<p>Posição da aula dentro do módulo</p>
													</RadixForm.Label>
												</div>
												<RadixForm.Control asChild>
													<input
														className="w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-hidden"
														disabled={isSubmittingAnyForm}
														required
														type="text"
													/>
												</RadixForm.Control>
											</RadixForm.Field>

											<RadixForm.Field name="moduleSlug">
												<RadixForm.Control asChild>
													<input
														className="hidden"
														disabled={isSubmittingAnyForm}
														type="text"
														value={module.module.slug}
													/>
												</RadixForm.Control>
											</RadixForm.Field>

											<RadixForm.Field className="hidden" name="formType">
												<RadixForm.Control asChild>
													<input
														disabled={isSubmittingAnyForm}
														type="text"
														value="existingLesson"
													/>
												</RadixForm.Control>
											</RadixForm.Field>

											<RadixForm.Submit asChild>
												<Button
													className="m-auto mt-2"
													isDisabled={isSubmittingAnyForm}
													preset={ButtonPreset.Primary}
													text="Adicionar Aula Existente"
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

					<div className="flex gap-4 my-4 flex-wrap">
						{module.module.lessons.map((lesson) => (
							<AdminEntityCard
								course={lesson.lesson}
								key={lesson.lesson.id}
								to={`./${lesson.lesson.slug}`}
							/>
						))}
					</div>
				</div>
			</>
		)
	);
}
