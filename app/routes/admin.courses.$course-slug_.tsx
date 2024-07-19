import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	unstable_defineLoader as defineLoader,
	unstable_defineAction as defineAction,
} from '@remix-run/node';
import {
	Form,
	type MetaArgs_SingleFetch,
	useLoaderData,
	useNavigation,
	useParams,
} from '@remix-run/react';
import * as Dialog from '@radix-ui/react-dialog';
import * as RadixForm from '@radix-ui/react-form';
import {useEffect, useState} from 'react';
import * as Switch from '@radix-ui/react-switch';
import {XMarkIcon} from '@heroicons/react/24/outline';
import Select from 'react-select';
import {CourseService} from '~/services/course.service.server';
import {commitUserSession, getUserSession} from '~/utils/session.server';
import {type TUser} from '~/types/user.type';
import {logger} from '~/utils/logger.util';
import {type TCourse} from '~/types/course.type';
import {AdminEntityCard} from '~/components/entities-cards.js';
import {Button, ButtonPreset, ButtonType} from '~/components/button.js';
import {Editor} from '~/components/text-editor.client.js';
import {YemSpinner} from '~/components/yem-spinner.js';
import {ModuleService} from '~/services/module.service.server';
import {type TModule} from '~/types/module.type';
import {useTextEditor} from '~/hooks/use-text-editor.hook';
import {ContentConverter} from '~/components/content-converter.js';
import {SuccessOrErrorMessage} from '~/components/admin-success-or-error-message.js';

export const meta = ({data}: MetaArgs_SingleFetch<typeof loader>) => ([
	{title: data?.course?.name ?? 'Cursos - Yoga em Movimento'},
	{name: 'description', content: data?.course?.description ?? 'Conheça os cursos oferecidos pela Yoga em Movimento'},
	{name: 'robots', content: 'noindex, nofollow'},
	...data!.meta,
]);

export const loader = defineLoader(async ({request, params, response}: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));
	const {'course-slug': courseSlug} = params;

	const meta = [
		{tagName: 'link', rel: 'canonical', href: new URL(`/admin/courses/${courseSlug}`, request.url).toString()},
	];

	response!.headers.set('Set-Cookie', await commitUserSession(userSession));

	try {
		const courseService = new CourseService();
		const {data: course} = await courseService.getBySlug(courseSlug!, userSession.data as TUser);
		const {data: courses} = await courseService.getAll(userSession.get('roles') as string[]);

		return {
			course,
			courses,
			error: userSession.get('error') as string | undefined,
			success: userSession.get('success') as string | undefined,
			meta,
		};
	} catch (error) {
		logger.logError(`Error getting course: ${(error as Error).message}`);
		return {
			course: undefined,
			courses: undefined,
			error: 'Erro ao buscar curso',
			success: undefined,
			meta,
		};
	}
});

export const action = defineAction(async ({request, response}: ActionFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));

	try {
		if ((userSession.get('roles') as string[])?.includes('admin')) {
			const formData = await request.formData();
			const courseService = new CourseService();

			switch (formData.get('type')) {
				case 'editCourse': {
					const id = formData.get('id') as string;

					const courseToUpdate: TCourse = {
						oldId: formData.get('oldId') as string,
						name: formData.get('name') as string,
						description: formData.get('description') as string,
						order: Number(formData.get('order')),
						content: formData.get('content') as string,
						marketingContent: formData.get('marketingContent') as string,
						videoSourceUrl: formData.get('videoSourceUrl') as string,
						marketingVideoUrl: formData.get('marketingVideoUrl') as string,
						thumbnailUrl: formData.get('thumbnailUrl') as string,
						publicationDate: new Date(formData.get('publicationDate') as string),
						isPublished: Boolean(formData.get('isPublished')),
						isSelling: Boolean(formData.get('isSelling')),
					};

					await courseService.update(id, courseToUpdate);

					userSession.flash('success', `Curso ${courseToUpdate.name} atualizado com sucesso`);
					break;
				}

				case 'newModule': {
					const moduleToCreate: TModule = {
						oldId: formData.get('oldId') as string,
						name: formData.get('name') as string,
						description: formData.get('description') as string,
						content: formData.get('content') as string,
						marketingContent: formData.get('marketingContent') as string,
						videoSourceUrl: formData.get('videoSourceUrl') as string,
						marketingVideoUrl: formData.get('marketingVideoUrl') as string,
						thumbnailUrl: formData.get('thumbnailUrl') as string,
						courses: (formData.get('courses') as string).split(','),
						publicationDate: new Date(formData.get('publicationDate') as string),
						isPublished: Boolean(formData.get('isPublished')),
						isLessonsOrderRandom: Boolean(formData.get('isLessonsOrderRandom')),
						order: Number(formData.get('order')),
					};

					await new ModuleService().create(moduleToCreate);

					userSession.flash('success', `Módulo ${moduleToCreate.name} criado com sucesso`);
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
					const delegateAuthToSlug = formData.get('delegateAuthToSlug') as string;

					await courseService.removeDelegateAuthTo(courseId, delegateAuthToSlug);

					userSession.flash('success', 'Autorização removida com sucesso');
					break;
				}

				default: {
					userSession.flash('error', 'Tipo de ação não reconhecido');
					break;
				}
			}
		} else {
			userSession.flash('error', 'Você não tem permissão para editar cursos ou adicionar novos módulos');
		}
	} catch (error) {
		logger.logError(`Error creating course: ${(error as Error).message}`);
		userSession.flash('error', `Error creating course: ${(error as Error).message}`);
	}

	response?.headers.set('Set-Cookie', await commitUserSession(userSession));

	return null;
});

export default function Course() {
	const {
		course,
		courses,
		error,
		success,
	} = useLoaderData<typeof loader>();
	const {'course-slug': courseSlug} = useParams();

	const [courseContent, setCourseContentEditor] = useTextEditor(course?.content);
	const [courseMktContent, setCourseMktContentEditor] = useTextEditor(course?.marketingContent);

	const [moduleContent, setModuleContentEditor] = useTextEditor();
	const [moduleMktContent, setModuleMktContentEditor] = useTextEditor();

	const [courseEditDialogIsOpen, setCourseEditDialogIsOpen] = useState<boolean>(false);
	const [newModuleDialogIsOpen, setNewModuleDialogIsOpen] = useState<boolean>(false);
	const [newDelegateAuthDialogIsOpen, setNewDelegateAuthDialogIsOpen] = useState<boolean>(false);
	const [coursesValue, setCoursesValue] = useState<Array<{value: string; label: string}>>(course ? [{value: course.slug, label: course.name}] : []);
	const [coursesSlug, setCoursesSlug] = useState<Array<{value: string; label: string}>>(course?.delegateAuthTo?.map(course => ({value: course.slug, label: course.name})) ?? []);
	const navigation = useNavigation();
	const isSubmittingAnyForm = navigation.formAction === `/admin/courses/${courseSlug}`;

	const defaultDate = new Date(course?.publicationDate ?? new Date());
	defaultDate.setHours(defaultDate.getHours() - 3);

	useEffect(() => {
		if (success ?? error) {
			setCourseEditDialogIsOpen(false);
			setNewModuleDialogIsOpen(false);
			setNewDelegateAuthDialogIsOpen(false);
		}
	}, [success, error]);

	return course && (
		<>
			<SuccessOrErrorMessage success={success} error={error}/>

			<Dialog.Root open={courseEditDialogIsOpen} onOpenChange={setCourseEditDialogIsOpen}>
				<div className='flex items-center gap-5'>
					<h1>{course.name}</h1>
					<Dialog.Trigger asChild>
						<div className='w-fit'>
							<Button
								preset={ButtonPreset.Primary}
								text='Editar o Curso'
								type={ButtonType.Button}
							/>
						</div>
					</Dialog.Trigger>
				</div>

				<Dialog.Portal>
					<Dialog.Overlay className='bg-mauvea-12 fixed inset-0'/>

					<Dialog.Content className='fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] p-4 max-w-screen-lg w-[90%] bg-mauve-2 dark:bg-mauvedark-2 rounded-xl overflow-y-auto max-h-[90%]'>
						<div>
							<Dialog.Title asChild>
								<h1 className='mb-4'>
									{`Editar o Curso ${course.name}`}
								</h1>
							</Dialog.Title>

							<RadixForm.Root asChild>
								<Form method='post' action={`/admin/courses/${courseSlug}`} className='flex flex-col gap-3'>

									<RadixForm.Field name='oldId'>
										<div className='flex items-baseline justify-between'>
											<RadixForm.Label>
												<p>ID da Antiga Plataforma</p>
											</RadixForm.Label>
										</div>
										<RadixForm.Control asChild>
											<input
												defaultValue={course.oldId ?? ''}
												disabled={isSubmittingAnyForm}
												type='text'
												min={8}
												className='w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-none'
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<RadixForm.Field name='name'>
										<div className='flex items-baseline justify-between'>
											<RadixForm.Label>
												<p>Nome</p>
											</RadixForm.Label>
										</div>
										<RadixForm.Control asChild>
											<input
												required
												defaultValue={course.name}
												disabled={isSubmittingAnyForm}
												type='text'
												min={8}
												className='w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-none'
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<RadixForm.Field name='description'>
										<div className='flex items-baseline justify-between'>
											<RadixForm.Label>
												<p>Descrição</p>
											</RadixForm.Label>
										</div>
										<RadixForm.Control asChild>
											<input
												required
												defaultValue={course.description ?? ''}
												disabled={isSubmittingAnyForm}
												type='text'
												min={8}
												className='w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-none'
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<RadixForm.Field name='order'>
										<div className='flex items-baseline justify-between'>
											<RadixForm.Label>
												<p>Posição do Curso</p>
											</RadixForm.Label>
										</div>
										<RadixForm.Control asChild>
											<input
												defaultValue={course.order ?? ''}
												disabled={isSubmittingAnyForm}
												type='number'
												className='w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-none'
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<RadixForm.Field name='content'>
										<div className='flex items-baseline justify-between'>
											<RadixForm.Label>
												<p>Conteúdo</p>
											</RadixForm.Label>
										</div>
										<RadixForm.Control asChild>
											<input
												disabled={isSubmittingAnyForm}
												type='text'
												min={8}
												className='hidden'
												value={courseContent}
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<Editor setQuill={setCourseContentEditor} placeholder='Adicione aqui o conteúdo do curso, que só aparece para os alunos...'/>

									<RadixForm.Field name='marketingContent'>
										<div className='flex items-baseline justify-between'>
											<RadixForm.Label>
												<p>Conteúdo para Divulgação</p>
											</RadixForm.Label>
										</div>
										<RadixForm.Control asChild>
											<input
												disabled={isSubmittingAnyForm}
												type='text'
												min={8}
												className='hidden'
												value={courseMktContent}
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<Editor setQuill={setCourseMktContentEditor} placeholder='Adicione aqui o conteúdo de divulgação do curso, que aparece para quem não é aluno...'/>

									<RadixForm.Field name='videoSourceUrl'>
										<div className='flex items-baseline justify-between'>
											<RadixForm.Label>
												<p>Vídeo</p>
											</RadixForm.Label>
										</div>
										<RadixForm.Control asChild>
											<input
												defaultValue={course.videoSourceUrl ?? ''}
												disabled={isSubmittingAnyForm}
												type='text'
												min={3}
												className='w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-none'
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<RadixForm.Field name='marketingVideoUrl'>
										<div className='flex items-baseline justify-between'>
											<RadixForm.Label>
												<p>Vídeo de Divulgação</p>
											</RadixForm.Label>
										</div>
										<RadixForm.Control asChild>
											<input
												defaultValue={course.marketingVideoUrl ?? ''}
												disabled={isSubmittingAnyForm}
												type='text'
												min={3}
												className='w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-none'
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<RadixForm.Field name='thumbnailUrl'>
										<div className='flex items-baseline justify-between'>
											<RadixForm.Label>
												<p>Imagem de capa</p>
											</RadixForm.Label>
										</div>
										<RadixForm.Control asChild>
											<input
												required
												defaultValue={course.thumbnailUrl}
												disabled={isSubmittingAnyForm}
												type='text'
												min={3}
												className='w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-none'
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<RadixForm.Field name='publicationDate'>
										<div className='flex items-baseline justify-between'>
											<RadixForm.Label>
												<p>Data de publicação</p>
											</RadixForm.Label>
										</div>
										<RadixForm.Control asChild>
											<input
												defaultValue={defaultDate.toISOString().slice(0, 16)}
												disabled={isSubmittingAnyForm}
												type='datetime-local'
												min={3}
												className='w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-none'
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<RadixForm.Field name='isPublished'>
										<div className='flex items-baseline justify-between'>
											<RadixForm.Label>
												<p>Está publicado</p>
											</RadixForm.Label>
										</div>
										<RadixForm.Control asChild>
											<Switch.Root
												defaultChecked={course.isPublished}
												disabled={isSubmittingAnyForm}
												className='w-[42px] h-[25px] bg-blacka-6 rounded-full relative shadow-[0_2px_10px] shadow-blacka-4 focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-black outline-none cursor-default'
											>
												<Switch.Thumb
													className='block w-[21px] h-[21px] bg-white rounded-full shadow-[0_2px_2px] shadow-blackA4 transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px]'
												/>
											</Switch.Root>
										</RadixForm.Control>
									</RadixForm.Field>

									<RadixForm.Field name='isSelling'>
										<div className='flex items-baseline justify-between'>
											<RadixForm.Label>
												<p>Está com matrículas abertas</p>
											</RadixForm.Label>
										</div>
										<RadixForm.Control asChild>
											<Switch.Root
												defaultChecked={course.isSelling}
												disabled={isSubmittingAnyForm}
												className='w-[42px] h-[25px] bg-blacka-6 rounded-full relative shadow-[0_2px_10px] shadow-blacka-4 focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-black outline-none cursor-default'
											>
												<Switch.Thumb
													className='block w-[21px] h-[21px] bg-white rounded-full shadow-[0_2px_2px] shadow-blackA4 transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px]'
												/>
											</Switch.Root>
										</RadixForm.Control>
									</RadixForm.Field>

									<RadixForm.Field name='type' className='hidden'>
										<RadixForm.Control asChild>
											<input
												disabled={isSubmittingAnyForm}
												type='text'
												value='editCourse'
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<RadixForm.Field name='id' className='hidden'>
										<RadixForm.Control asChild>
											<input
												disabled={isSubmittingAnyForm}
												type='text'
												value={course.id}
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<RadixForm.Submit asChild>
										<Button key='Editar o Curso' isDisabled={isSubmittingAnyForm} className='m-auto mt-2' text='Editar o Curso' preset={ButtonPreset.Primary} type={ButtonType.Submit}/>
									</RadixForm.Submit>

									{isSubmittingAnyForm && <YemSpinner/>}

								</Form>
							</RadixForm.Root>
						</div>

						<Dialog.Close asChild>
							<button
								type='button'
								className='absolute top-[10px] right-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center outline-none'
								aria-label='Close'
							>
								<XMarkIcon aria-label='Close' className='hover:pointer absolute top-[10px] right-[10px] inline-flex h-[25px] w-[25px]'/>
							</button>
						</Dialog.Close>
					</Dialog.Content>
				</Dialog.Portal>
			</Dialog.Root>

			<div>
				<h2>{course.description}</h2>

				<p>Data de publicação: {new Date(course.publicationDate).toLocaleString('pt-BR')}</p>
				<p>Está publicado: {course.isPublished ? 'sim' : 'não'}</p>
				<p>Está com matrículas abertas: {course?.isSelling ? 'sim' : 'não'}</p>

				{course.content && (
					<>
						<h2>Conteúdo do curso:</h2>
						<ContentConverter content={course.content} className='p-4 rounded-lg border-2 border-mauve-6 dark:border-mauvedark-6 max-w-screen-lg'/>
					</>
				)}

				<Dialog.Root open={newDelegateAuthDialogIsOpen} onOpenChange={setNewDelegateAuthDialogIsOpen}>
					<div className='flex items-center gap-5'>
						<h2>Delegou autorização para:</h2>
						<Dialog.Trigger asChild>
							<div className='w-fit'>
								<Button
									preset={ButtonPreset.Primary}
									text='Adicionar Nova Autorização'
									type={ButtonType.Button}
								/>
							</div>
						</Dialog.Trigger>

						<Dialog.Portal>
							<Dialog.Overlay className='bg-mauvea-12 fixed inset-0'/>

							<Dialog.Content className='fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] p-4 max-w-screen-lg w-[90%] bg-mauve-2 dark:bg-mauvedark-2 rounded-xl overflow-y-auto max-h-[90%]'>
								<Dialog.Title asChild>
									<h1 className='mb-4'>
										Adicionar Nova Autorização
									</h1>
								</Dialog.Title>

								<RadixForm.Root asChild>
									<Form method='post' action={`/admin/courses/${courseSlug}`} className='flex flex-col gap-3'>
										<RadixForm.Field name='type'>

											<RadixForm.Control asChild>
												<input
													disabled={isSubmittingAnyForm}
													type='text'
													className='hidden'
													value='addDelegateAuth'
												/>
											</RadixForm.Control>
										</RadixForm.Field>

										<RadixForm.Field name='courseId'>
											<RadixForm.Control asChild>
												<input
													disabled={isSubmittingAnyForm}
													type='text'
													className='hidden'
													value={course.id}
												/>
											</RadixForm.Control>
										</RadixForm.Field>

										<RadixForm.Field name='courses'>
											<div className='flex items-baseline justify-between'>
												<RadixForm.Label>
													<p>Cursos</p>
												</RadixForm.Label>
											</div>
											<RadixForm.Control asChild>
												<input
													disabled={isSubmittingAnyForm}
													type='text'
													className='hidden'
													value={coursesSlug.map(course => course.value).join(',')}
												/>
											</RadixForm.Control>
											<Select
												isMulti
												value={coursesSlug}
												options={courses?.map(course => ({value: course.slug, label: course.name}))}
												onChange={selectedOption => {
													setCoursesSlug(selectedOption as Array<{value: string; label: string}>);
												}}
											/>
										</RadixForm.Field>

										<RadixForm.Submit asChild>
											<Button isDisabled={isSubmittingAnyForm} className='m-auto mt-2' text='Adicionar Autorização' preset={ButtonPreset.Primary} type={ButtonType.Submit}/>
										</RadixForm.Submit>

										{isSubmittingAnyForm && <YemSpinner/>}

									</Form>
								</RadixForm.Root>
							</Dialog.Content>
						</Dialog.Portal>
					</div>
				</Dialog.Root>

				{course.delegateAuthTo.length > 0 ? course.delegateAuthTo.map(delegatedToCourse => (
					<div key={delegatedToCourse.id} className='flex items-center gap-5'>
						<p>{delegatedToCourse.name}</p>
						<RadixForm.Root asChild>
							<Form method='post' action={`/admin/courses/${courseSlug}`}>

								<RadixForm.Field name='type'>
									<RadixForm.Control asChild>
										<input
											disabled={isSubmittingAnyForm}
											type='text'
											className='hidden'
											value='removeDelegateAuth'
										/>
									</RadixForm.Control>
								</RadixForm.Field>

								<RadixForm.Field name='courseId'>
									<RadixForm.Control asChild>
										<input
											disabled={isSubmittingAnyForm}
											type='text'
											className='hidden'
											value={course.id}
										/>
									</RadixForm.Control>
								</RadixForm.Field>

								<RadixForm.Field name='delegateAuthToSlug'>
									<RadixForm.Control asChild>
										<input
											disabled={isSubmittingAnyForm}
											type='text'
											className='hidden'
											value={delegatedToCourse.slug}
										/>
									</RadixForm.Control>
								</RadixForm.Field>

								<RadixForm.Submit asChild>
									<Button isDisabled={isSubmittingAnyForm} className='m-auto mt-2' text='Remover Autorização' preset={ButtonPreset.Primary} type={ButtonType.Submit}/>
								</RadixForm.Submit>

							</Form>
						</RadixForm.Root>
					</div>
				)) : (<p>Nenhum curso</p>)}
			</div>
			<div>

				<Dialog.Root open={newModuleDialogIsOpen} onOpenChange={setNewModuleDialogIsOpen}>

					<div className='flex items-center gap-5'>
						<h2>Módulos</h2>
						<Dialog.Trigger asChild>
							<div className='w-fit'>
								<Button
									preset={ButtonPreset.Primary}
									text='Adicionar Novo Módulo'
									type={ButtonType.Button}
								/>
							</div>
						</Dialog.Trigger>
					</div>

					<Dialog.Portal>
						<Dialog.Overlay className='bg-mauvea-12 fixed inset-0'/>

						<Dialog.Content className='fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] p-4 max-w-screen-lg w-[90%] bg-mauve-2 dark:bg-mauvedark-2 rounded-xl overflow-y-auto max-h-[90%]'>
							<Dialog.Title asChild>
								<h1 className='mb-4'>
									Adicionar Novo Módulo
								</h1>
							</Dialog.Title>

							<RadixForm.Root asChild>
								<Form method='post' action={`/admin/courses/${courseSlug}`} className='flex flex-col gap-3'>

									<RadixForm.Field name='oldId'>
										<div className='flex items-baseline justify-between'>
											<RadixForm.Label>
												<p>ID da Antiga Plataforma</p>
											</RadixForm.Label>
										</div>
										<RadixForm.Control asChild>
											<input
												disabled={isSubmittingAnyForm}
												type='text'
												min={8}
												className='w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-none'
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<RadixForm.Field name='name'>
										<div className='flex items-baseline justify-between'>
											<RadixForm.Label>
												<p>Nome</p>
											</RadixForm.Label>
										</div>
										<RadixForm.Control asChild>
											<input
												required
												disabled={isSubmittingAnyForm}
												type='text'
												min={8}
												className='w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-none'
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<RadixForm.Field name='description'>
										<div className='flex items-baseline justify-between'>
											<RadixForm.Label>
												<p>Descrição</p>
											</RadixForm.Label>
										</div>
										<RadixForm.Control asChild>
											<input
												required
												disabled={isSubmittingAnyForm}
												type='text'
												min={8}
												className='w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-none'
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<RadixForm.Field name='content'>
										<div className='flex items-baseline justify-between'>
											<RadixForm.Label>
												<p>Conteúdo</p>
											</RadixForm.Label>
										</div>
										<RadixForm.Control asChild>
											<input
												disabled={isSubmittingAnyForm}
												type='text'
												min={8}
												className='hidden'
												value={moduleContent}
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<Editor setQuill={setModuleContentEditor} placeholder='Adicione aqui o conteúdo do módulo, que só aparece para os alunos...'/>

									<RadixForm.Field name='marketingContent'>
										<div className='flex items-baseline justify-between'>
											<RadixForm.Label>
												<p>Conteúdo de Divulgação</p>
											</RadixForm.Label>
										</div>
										<RadixForm.Control asChild>
											<input
												disabled={isSubmittingAnyForm}
												type='text'
												min={8}
												className='hidden'
												value={moduleMktContent}
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<Editor setQuill={setModuleMktContentEditor} placeholder='Adicione aqui o conteúdo de divulgação do módulo, que aparece para quem não é aluno...'/>

									<RadixForm.Field name='videoSourceUrl'>
										<div className='flex items-baseline justify-between'>
											<RadixForm.Label>
												<p>Vídeo</p>
											</RadixForm.Label>
										</div>
										<RadixForm.Control asChild>
											<input
												disabled={isSubmittingAnyForm}
												type='text'
												min={3}
												className='w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-none'
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<RadixForm.Field name='marketingVideoUrl'>
										<div className='flex items-baseline justify-between'>
											<RadixForm.Label>
												<p>Vídeo de Divulgação</p>
											</RadixForm.Label>
										</div>
										<RadixForm.Control asChild>
											<input
												disabled={isSubmittingAnyForm}
												type='text'
												min={3}
												className='w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-none'
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<RadixForm.Field name='thumbnailUrl'>
										<div className='flex items-baseline justify-between'>
											<RadixForm.Label>
												<p>Imagem de capa</p>
											</RadixForm.Label>
										</div>
										<RadixForm.Control asChild>
											<input
												required
												disabled={isSubmittingAnyForm}
												type='text'
												min={3}
												className='w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-none'
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<RadixForm.Field name='courses'>
										<div className='flex items-baseline justify-between'>
											<RadixForm.Label>
												<p>Cursos</p>
											</RadixForm.Label>
										</div>
										<RadixForm.Control asChild>
											<input
												disabled={isSubmittingAnyForm}
												type='text'
												className='hidden'
												value={coursesValue.map(course => course.value).join(',')}
											/>
										</RadixForm.Control>
										<Select
											isMulti
											value={coursesValue}
											options={courses?.map(course => ({value: course.slug, label: course.name}))}
											onChange={selectedOption => {
												setCoursesValue(selectedOption as Array<{value: string; label: string}>);
											}}
										/>
									</RadixForm.Field>

									<RadixForm.Field name='type'>
										<RadixForm.Control asChild>
											<input
												disabled={isSubmittingAnyForm}
												type='text'
												className='hidden'
												value='newModule'
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<RadixForm.Field name='publicationDate'>
										<div className='flex items-baseline justify-between'>
											<RadixForm.Label>
												<p>Data de publicação</p>
											</RadixForm.Label>
										</div>
										<RadixForm.Control asChild>
											<input
												defaultValue={defaultDate.toISOString().slice(0, 16)}
												disabled={isSubmittingAnyForm}
												type='datetime-local'
												min={3}
												className='w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-none'
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<RadixForm.Field name='isPublished'>
										<div className='flex items-baseline justify-between'>
											<RadixForm.Label>
												<p>Está publicado</p>
											</RadixForm.Label>
										</div>
										<RadixForm.Control asChild>
											<Switch.Root
												disabled={isSubmittingAnyForm}
												className='w-[42px] h-[25px] bg-blacka-6 rounded-full relative shadow-[0_2px_10px] shadow-blacka-4 focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-black outline-none cursor-default'
											>
												<Switch.Thumb
													className='block w-[21px] h-[21px] bg-white rounded-full shadow-[0_2px_2px] shadow-blackA4 transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px]'
												/>
											</Switch.Root>
										</RadixForm.Control>
									</RadixForm.Field>

									<RadixForm.Field name='isLessonsOrderRandom'>
										<div className='flex items-baseline justify-between'>
											<RadixForm.Label>
												<p>As aulas deste módulo devem ser embaralhadas?</p>
											</RadixForm.Label>
										</div>
										<RadixForm.Control asChild>
											<Switch.Root
												disabled={isSubmittingAnyForm}
												className='w-[42px] h-[25px] bg-blacka-6 rounded-full relative shadow-[0_2px_10px] shadow-blacka-4 focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-black outline-none cursor-default'
											>
												<Switch.Thumb
													className='block w-[21px] h-[21px] bg-white rounded-full shadow-[0_2px_2px] shadow-blackA4 transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px]'
												/>
											</Switch.Root>
										</RadixForm.Control>
									</RadixForm.Field>

									<RadixForm.Field name='order'>
										<div className='flex items-baseline justify-between'>
											<RadixForm.Label>
												<p>Posição deste módulo dentro do curso</p>
											</RadixForm.Label>
										</div>
										<RadixForm.Control asChild>
											<input
												required
												disabled={isSubmittingAnyForm}
												type='number'
												className='w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-none'
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<RadixForm.Submit asChild>
										<Button isDisabled={isSubmittingAnyForm} className='m-auto mt-2' text='Criar Novo Módulo' preset={ButtonPreset.Primary} type={ButtonType.Submit}/>
									</RadixForm.Submit>

									{isSubmittingAnyForm && <YemSpinner/>}

								</Form>
							</RadixForm.Root>

							<Dialog.Close asChild>
								<button
									type='button'
									className='absolute top-[10px] right-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center outline-none'
									aria-label='Close'
								>
									<XMarkIcon aria-label='Close' className='hover:pointer absolute top-[10px] right-[10px] inline-flex h-[25px] w-[25px]'/>
								</button>
							</Dialog.Close>
						</Dialog.Content>
					</Dialog.Portal>

				</Dialog.Root>

				<div className='flex gap-4 my-4 flex-wrap'>
					{course.modules.map(module => (
						<AdminEntityCard key={module.module.id} course={module.module} to={`./${module.module.slug}`}/>
					))}
				</div>

			</div>
		</>
	);
}
