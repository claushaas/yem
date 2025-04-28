/* eslint-disable @typescript-eslint/naming-convention */

import { XMarkIcon } from '@heroicons/react/24/outline';
import * as Dialog from '@radix-ui/react-dialog';
import * as RadixForm from '@radix-ui/react-form';
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
import { useTextEditor } from '~/hooks/use-text-editor.hook';
import { CourseService } from '~/services/course.service.server';
import { ModuleService } from '~/services/module.service.server';
import { type TCourse } from '~/types/course.type';
import { type TModule } from '~/types/module.type';
import { type TUser } from '~/types/user.type';
import { logger } from '~/utils/logger.util';
import { commitUserSession, getUserSession } from '~/utils/session.server';

export const meta = ({ data }: MetaArgs<typeof loader>) => [
	{ title: data?.course?.name ?? 'Cursos - Yoga em Movimento' },
	{
		content:
			data?.course?.description ??
			'Conheça os cursos oferecidos pela Yoga em Movimento',
		name: 'description',
	},
	{ content: 'noindex, nofollow', name: 'robots' },
	...data!.meta,
];

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));
	const { 'course-slug': courseSlug } = params;

	const meta = [
		{
			href: new URL(`/admin/courses/${courseSlug}`, request.url).toString(),
			rel: 'canonical',
			tagName: 'link',
		},
	];

	try {
		const courseService = new CourseService();
		const { data: course } = await courseService.getBySlug(
			courseSlug!,
			userSession.data as TUser,
		);
		const { data: courses } = await courseService.getAll(
			userSession.get('roles') as string[],
		);

		return data(
			{
				course,
				courses,
				error: userSession.get('error') as string | undefined,
				meta,
				success: userSession.get('success') as string | undefined,
			},
			{
				headers: {
					'Set-Cookie': await commitUserSession(userSession),
				},
			},
		);
	} catch (error) {
		logger.logError(`Error getting course: ${(error as Error).message}`);
		return data(
			{
				course: undefined,
				courses: undefined,
				error: 'Erro ao buscar curso',
				meta,
				success: undefined,
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
			const courseService = new CourseService();

			switch (formData.get('type')) {
				case 'editCourse': {
					const id = formData.get('id') as string;

					const courseToUpdate: TCourse = {
						content: formData.get('content') as string,
						description: formData.get('description') as string,
						isPublished: Boolean(formData.get('isPublished')),
						isSelling: Boolean(formData.get('isSelling')),
						marketingContent: formData.get('marketingContent') as string,
						marketingVideoUrl: formData.get('marketingVideoUrl') as string,
						name: formData.get('name') as string,
						oldId: formData.get('oldId') as string,
						order: Number(formData.get('order')),
						publicationDate: new Date(
							formData.get('publicationDate') as string,
						),
						thumbnailUrl: formData.get('thumbnailUrl') as string,
						videoSourceUrl: formData.get('videoSourceUrl') as string,
					};

					await courseService.update(id, courseToUpdate);

					userSession.flash(
						'success',
						`Curso ${courseToUpdate.name} atualizado com sucesso`,
					);
					break;
				}

				case 'newModule': {
					const moduleToCreate: TModule = {
						content: formData.get('content') as string,
						courses: (formData.get('courses') as string).split(','),
						description: formData.get('description') as string,
						isLessonsOrderRandom: Boolean(formData.get('isLessonsOrderRandom')),
						isPublished: Boolean(formData.get('isPublished')),
						marketingContent: formData.get('marketingContent') as string,
						marketingVideoUrl: formData.get('marketingVideoUrl') as string,
						name: formData.get('name') as string,
						oldId: formData.get('oldId') as string,
						order: Number(formData.get('order')),
						publicationDate: new Date(
							formData.get('publicationDate') as string,
						),
						showTagsFilters: Boolean(formData.get('showTagsFilters')),
						thumbnailUrl: formData.get('thumbnailUrl') as string,
						videoSourceUrl: formData.get('videoSourceUrl') as string,
					};

					await new ModuleService().create(moduleToCreate);

					userSession.flash(
						'success',
						`Módulo ${moduleToCreate.name} criado com sucesso`,
					);
					break;
				}

				case 'addDelegateAuth': {
					const courseId = formData.get('courseId') as string;
					const courses = (formData.get('courses') as string).split(',');

					await courseService.addDelegateAuthTo(courseId, courses);

					userSession.flash('success', 'Autorização adicionada com sucesso');
					break;
				}

				case 'removeDelegateAuth': {
					const courseId = formData.get('courseId') as string;
					const delegateAuthToSlug = formData.get(
						'delegateAuthToSlug',
					) as string;

					await courseService.removeDelegateAuthTo(
						courseId,
						delegateAuthToSlug,
					);

					userSession.flash('success', 'Autorização removida com sucesso');
					break;
				}

				default: {
					userSession.flash('error', 'Tipo de ação não reconhecido');
					break;
				}
			}
		} else {
			userSession.flash(
				'error',
				'Você não tem permissão para editar cursos ou adicionar novos módulos',
			);
		}
	} catch (error) {
		logger.logError(`Error creating course: ${(error as Error).message}`);
		userSession.flash(
			'error',
			`Error creating course: ${(error as Error).message}`,
		);
	}

	return data(
		{},
		{ headers: { 'Set-Cookie': await commitUserSession(userSession) } },
	);
};

export default function Course() {
	const { course, courses, error, success } = useLoaderData<typeof loader>();
	const { 'course-slug': courseSlug } = useParams();

	const [courseContent, setCourseContentEditor] = useTextEditor(
		course?.content,
	);
	const [courseMktContent, setCourseMktContentEditor] = useTextEditor(
		course?.marketingContent,
	);

	const [moduleContent, setModuleContentEditor] = useTextEditor();
	const [moduleMktContent, setModuleMktContentEditor] = useTextEditor();

	const [courseEditDialogIsOpen, setCourseEditDialogIsOpen] =
		useState<boolean>(false);
	const [newModuleDialogIsOpen, setNewModuleDialogIsOpen] =
		useState<boolean>(false);
	const [newDelegateAuthDialogIsOpen, setNewDelegateAuthDialogIsOpen] =
		useState<boolean>(false);
	const [coursesValue, setCoursesValue] = useState<
		Array<{ value: string; label: string }>
	>(course ? [{ label: course.name, value: course.slug }] : []);
	const [coursesSlug, setCoursesSlug] = useState<
		Array<{ value: string; label: string }>
	>(
		course?.delegateAuthTo?.map((course) => ({
			label: course.name,
			value: course.slug,
		})) ?? [],
	);
	const navigation = useNavigation();
	const isSubmittingAnyForm =
		navigation.formAction === `/admin/courses/${courseSlug}`;

	const defaultDate = new Date(course?.publicationDate ?? new Date());
	defaultDate.setHours(defaultDate.getHours() - 3);

	useEffect(() => {
		if (success ?? error) {
			setCourseEditDialogIsOpen(false);
			setNewModuleDialogIsOpen(false);
			setNewDelegateAuthDialogIsOpen(false);
		}
	}, [success, error]);

	return (
		course && (
			<>
				<SuccessOrErrorMessage error={error} success={success} />

				<Dialog.Root
					onOpenChange={setCourseEditDialogIsOpen}
					open={courseEditDialogIsOpen}
				>
					<div className="flex items-center gap-5">
						<h1>{course.name}</h1>
						<Dialog.Trigger asChild>
							<div className="w-fit">
								<Button
									preset={ButtonPreset.Primary}
									text="Editar o Curso"
									type={ButtonType.Button}
								/>
							</div>
						</Dialog.Trigger>
					</div>

					<Dialog.Portal>
						<Dialog.Overlay className="bg-mauvea-12 fixed inset-0" />

						<Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] p-4 max-w-(--breakpoint-lg) w-[90%] bg-mauve-2 dark:bg-mauvedark-2 rounded-xl overflow-y-auto max-h-[90%]">
							<div>
								<Dialog.Title asChild>
									<h1 className="mb-4">{`Editar o Curso ${course.name}`}</h1>
								</Dialog.Title>

								<RadixForm.Root asChild>
									<Form
										action={`/admin/courses/${courseSlug}`}
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
													defaultValue={course.oldId ?? ''}
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
													defaultValue={course.name}
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
													defaultValue={course.description ?? ''}
													disabled={isSubmittingAnyForm}
													min={8}
													required
													type="text"
												/>
											</RadixForm.Control>
										</RadixForm.Field>

										<RadixForm.Field name="order">
											<div className="flex items-baseline justify-between">
												<RadixForm.Label>
													<p>Posição do Curso</p>
												</RadixForm.Label>
											</div>
											<RadixForm.Control asChild>
												<input
													className="w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-hidden"
													defaultValue={course.order ?? ''}
													disabled={isSubmittingAnyForm}
													type="number"
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
													value={courseContent}
												/>
											</RadixForm.Control>
										</RadixForm.Field>

										<Editor
											placeholder="Adicione aqui o conteúdo do curso, que só aparece para os alunos..."
											setQuill={setCourseContentEditor}
										/>

										<RadixForm.Field name="marketingContent">
											<div className="flex items-baseline justify-between">
												<RadixForm.Label>
													<p>Conteúdo para Divulgação</p>
												</RadixForm.Label>
											</div>
											<RadixForm.Control asChild>
												<input
													className="hidden"
													disabled={isSubmittingAnyForm}
													min={8}
													type="text"
													value={courseMktContent}
												/>
											</RadixForm.Control>
										</RadixForm.Field>

										<Editor
											placeholder="Adicione aqui o conteúdo de divulgação do curso, que aparece para quem não é aluno..."
											setQuill={setCourseMktContentEditor}
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
													defaultValue={course.videoSourceUrl ?? ''}
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
													defaultValue={course.marketingVideoUrl ?? ''}
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
													defaultValue={course.thumbnailUrl}
													disabled={isSubmittingAnyForm}
													min={3}
													required
													type="text"
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
													defaultValue={defaultDate.toISOString().slice(0, 16)}
													disabled={isSubmittingAnyForm}
													min={3}
													type="datetime-local"
												/>
											</RadixForm.Control>
										</RadixForm.Field>

										<RadixForm.Field name="isPublished">
											<div className="flex items-baseline justify-between">
												<RadixForm.Label>
													<p>Está publicado</p>
												</RadixForm.Label>
											</div>
											<RadixForm.Control asChild>
												<Switch.Root
													className="w-[42px] h-[25px] bg-blacka-6 rounded-full relative shadow-[0_2px_10px] shadow-blacka-4 focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-black outline-hidden cursor-default"
													defaultChecked={course.isPublished}
													disabled={isSubmittingAnyForm}
												>
													<Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full shadow-[0_2px_2px] shadow-blackA4 transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px]" />
												</Switch.Root>
											</RadixForm.Control>
										</RadixForm.Field>

										<RadixForm.Field name="isSelling">
											<div className="flex items-baseline justify-between">
												<RadixForm.Label>
													<p>Está com matrículas abertas</p>
												</RadixForm.Label>
											</div>
											<RadixForm.Control asChild>
												<Switch.Root
													className="w-[42px] h-[25px] bg-blacka-6 rounded-full relative shadow-[0_2px_10px] shadow-blacka-4 focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-black outline-hidden cursor-default"
													defaultChecked={course.isSelling}
													disabled={isSubmittingAnyForm}
												>
													<Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full shadow-[0_2px_2px] shadow-blackA4 transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px]" />
												</Switch.Root>
											</RadixForm.Control>
										</RadixForm.Field>

										<RadixForm.Field className="hidden" name="type">
											<RadixForm.Control asChild>
												<input
													disabled={isSubmittingAnyForm}
													type="text"
													value="editCourse"
												/>
											</RadixForm.Control>
										</RadixForm.Field>

										<RadixForm.Field className="hidden" name="id">
											<RadixForm.Control asChild>
												<input
													disabled={isSubmittingAnyForm}
													type="text"
													value={course.id}
												/>
											</RadixForm.Control>
										</RadixForm.Field>

										<RadixForm.Submit asChild>
											<Button
												className="m-auto mt-2"
												isDisabled={isSubmittingAnyForm}
												key="Editar o Curso"
												preset={ButtonPreset.Primary}
												text="Editar o Curso"
												type={ButtonType.Submit}
											/>
										</RadixForm.Submit>

										{isSubmittingAnyForm && <YemSpinner />}
									</Form>
								</RadixForm.Root>
							</div>

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
					<h2>{course.description}</h2>

					<p>
						Data de publicação:{' '}
						{new Date(course.publicationDate).toLocaleString('pt-BR')}
					</p>
					<p>Está publicado: {course.isPublished ? 'sim' : 'não'}</p>
					<p>
						Está com matrículas abertas: {course?.isSelling ? 'sim' : 'não'}
					</p>

					{course.content && (
						<>
							<h2>Conteúdo do curso:</h2>
							<ContentConverter
								className="p-4 rounded-lg border-2 border-mauve-6 dark:border-mauvedark-6 max-w-(--breakpoint-lg)"
								content={course.content}
							/>
						</>
					)}

					<Dialog.Root
						onOpenChange={setNewDelegateAuthDialogIsOpen}
						open={newDelegateAuthDialogIsOpen}
					>
						<div className="flex items-center gap-5">
							<h2>Delegou autorização para:</h2>
							<Dialog.Trigger asChild>
								<div className="w-fit">
									<Button
										preset={ButtonPreset.Primary}
										text="Adicionar Nova Autorização"
										type={ButtonType.Button}
									/>
								</div>
							</Dialog.Trigger>

							<Dialog.Portal>
								<Dialog.Overlay className="bg-mauvea-12 fixed inset-0" />

								<Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] p-4 max-w-(--breakpoint-lg) w-[90%] bg-mauve-2 dark:bg-mauvedark-2 rounded-xl overflow-y-auto max-h-[90%]">
									<Dialog.Title asChild>
										<h1 className="mb-4">Adicionar Nova Autorização</h1>
									</Dialog.Title>

									<RadixForm.Root asChild>
										<Form
											action={`/admin/courses/${courseSlug}`}
											className="flex flex-col gap-3"
											method="post"
										>
											<RadixForm.Field name="type">
												<RadixForm.Control asChild>
													<input
														className="hidden"
														disabled={isSubmittingAnyForm}
														type="text"
														value="addDelegateAuth"
													/>
												</RadixForm.Control>
											</RadixForm.Field>

											<RadixForm.Field name="courseId">
												<RadixForm.Control asChild>
													<input
														className="hidden"
														disabled={isSubmittingAnyForm}
														type="text"
														value={course.id}
													/>
												</RadixForm.Control>
											</RadixForm.Field>

											<RadixForm.Field name="courses">
												<div className="flex items-baseline justify-between">
													<RadixForm.Label>
														<p>Cursos</p>
													</RadixForm.Label>
												</div>
												<RadixForm.Control asChild>
													<input
														className="hidden"
														disabled={isSubmittingAnyForm}
														type="text"
														value={coursesSlug
															.map((course) => course.value)
															.join(',')}
													/>
												</RadixForm.Control>
												<Select
													isMulti
													onChange={(selectedOption) => {
														setCoursesSlug(
															selectedOption as Array<{
																value: string;
																label: string;
															}>,
														);
													}}
													options={courses?.map((course) => ({
														label: course.name,
														value: course.slug,
													}))}
													value={coursesSlug}
												/>
											</RadixForm.Field>

											<RadixForm.Submit asChild>
												<Button
													className="m-auto mt-2"
													isDisabled={isSubmittingAnyForm}
													preset={ButtonPreset.Primary}
													text="Adicionar Autorização"
													type={ButtonType.Submit}
												/>
											</RadixForm.Submit>

											{isSubmittingAnyForm && <YemSpinner />}
										</Form>
									</RadixForm.Root>
								</Dialog.Content>
							</Dialog.Portal>
						</div>
					</Dialog.Root>

					{course.delegateAuthTo.length > 0 ? (
						course.delegateAuthTo.map((delegatedToCourse) => (
							<div
								className="flex items-center gap-5"
								key={delegatedToCourse.id}
							>
								<p>{delegatedToCourse.name}</p>
								<RadixForm.Root asChild>
									<Form action={`/admin/courses/${courseSlug}`} method="post">
										<RadixForm.Field name="type">
											<RadixForm.Control asChild>
												<input
													className="hidden"
													disabled={isSubmittingAnyForm}
													type="text"
													value="removeDelegateAuth"
												/>
											</RadixForm.Control>
										</RadixForm.Field>

										<RadixForm.Field name="courseId">
											<RadixForm.Control asChild>
												<input
													className="hidden"
													disabled={isSubmittingAnyForm}
													type="text"
													value={course.id}
												/>
											</RadixForm.Control>
										</RadixForm.Field>

										<RadixForm.Field name="delegateAuthToSlug">
											<RadixForm.Control asChild>
												<input
													className="hidden"
													disabled={isSubmittingAnyForm}
													type="text"
													value={delegatedToCourse.slug}
												/>
											</RadixForm.Control>
										</RadixForm.Field>

										<RadixForm.Submit asChild>
											<Button
												className="m-auto mt-2"
												isDisabled={isSubmittingAnyForm}
												preset={ButtonPreset.Primary}
												text="Remover Autorização"
												type={ButtonType.Submit}
											/>
										</RadixForm.Submit>
									</Form>
								</RadixForm.Root>
							</div>
						))
					) : (
						<p>Nenhum curso</p>
					)}
				</div>
				<div>
					<Dialog.Root
						onOpenChange={setNewModuleDialogIsOpen}
						open={newModuleDialogIsOpen}
					>
						<div className="flex items-center gap-5">
							<h2>Módulos</h2>
							<Dialog.Trigger asChild>
								<div className="w-fit">
									<Button
										preset={ButtonPreset.Primary}
										text="Adicionar Novo Módulo"
										type={ButtonType.Button}
									/>
								</div>
							</Dialog.Trigger>
						</div>

						<Dialog.Portal>
							<Dialog.Overlay className="bg-mauvea-12 fixed inset-0" />

							<Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] p-4 max-w-(--breakpoint-lg) w-[90%] bg-mauve-2 dark:bg-mauvedark-2 rounded-xl overflow-y-auto max-h-[90%]">
								<Dialog.Title asChild>
									<h1 className="mb-4">Adicionar Novo Módulo</h1>
								</Dialog.Title>

								<RadixForm.Root asChild>
									<Form
										action={`/admin/courses/${courseSlug}`}
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

										<RadixForm.Field name="courses">
											<div className="flex items-baseline justify-between">
												<RadixForm.Label>
													<p>Cursos</p>
												</RadixForm.Label>
											</div>
											<RadixForm.Control asChild>
												<input
													className="hidden"
													disabled={isSubmittingAnyForm}
													type="text"
													value={coursesValue
														.map((course) => course.value)
														.join(',')}
												/>
											</RadixForm.Control>
											<Select
												isMulti
												onChange={(selectedOption) => {
													setCoursesValue(
														selectedOption as Array<{
															value: string;
															label: string;
														}>,
													);
												}}
												options={courses?.map((course) => ({
													label: course.name,
													value: course.slug,
												}))}
												value={coursesValue}
											/>
										</RadixForm.Field>

										<RadixForm.Field name="type">
											<RadixForm.Control asChild>
												<input
													className="hidden"
													disabled={isSubmittingAnyForm}
													type="text"
													value="newModule"
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
													defaultValue={defaultDate.toISOString().slice(0, 16)}
													disabled={isSubmittingAnyForm}
													min={3}
													type="datetime-local"
												/>
											</RadixForm.Control>
										</RadixForm.Field>

										<RadixForm.Field name="isPublished">
											<div className="flex items-baseline justify-between">
												<RadixForm.Label>
													<p>Está publicado</p>
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

										<RadixForm.Field name="isLessonsOrderRandom">
											<div className="flex items-baseline justify-between">
												<RadixForm.Label>
													<p>As aulas deste módulo devem ser embaralhadas?</p>
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

										<RadixForm.Field name="showTagsFilters">
											<div className="flex items-baseline justify-between">
												<RadixForm.Label>
													<p>Mostrar os filtros de tags?</p>
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
													<p>Posição deste módulo dentro do curso</p>
												</RadixForm.Label>
											</div>
											<RadixForm.Control asChild>
												<input
													className="w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-hidden"
													disabled={isSubmittingAnyForm}
													required
													type="number"
												/>
											</RadixForm.Control>
										</RadixForm.Field>

										<RadixForm.Submit asChild>
											<Button
												className="m-auto mt-2"
												isDisabled={isSubmittingAnyForm}
												preset={ButtonPreset.Primary}
												text="Criar Novo Módulo"
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

					<div className="flex gap-4 my-4 flex-wrap">
						{course.modules.map((module) => (
							<AdminEntityCard
								course={module.module}
								key={module.module.id}
								to={`./${module.module.slug}`}
							/>
						))}
					</div>
				</div>
			</>
		)
	);
}
