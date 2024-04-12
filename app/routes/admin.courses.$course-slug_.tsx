import {
	type ActionFunctionArgs, json, type LoaderFunctionArgs, redirect,
} from '@remix-run/node';
import {
	Form, useLoaderData, useNavigation, useParams,
} from '@remix-run/react';
import {QuillDeltaToHtmlConverter} from 'quill-delta-to-html';
import {type Delta, type OpIterator} from 'quill/core';
import * as Dialog from '@radix-ui/react-dialog';
import * as RadixForm from '@radix-ui/react-form';
import type Quill from 'quill';
import {useEffect, useState} from 'react';
import {ClientOnly} from 'remix-utils/client-only';
import * as Switch from '@radix-ui/react-switch';
import {XMarkIcon} from '@heroicons/react/24/outline';
import Select from 'react-select';
import {CourseService} from '~/services/course.service.server';
import {commitUserSession, getUserSession} from '~/utils/session.server';
import {type TUser} from '~/types/user.type';
import {logger} from '~/utils/logger.util';
import {type TCourse, type TPrismaPayloadGetAllCourses, type TPrismaPayloadGetCourseById} from '~/types/course.type';
import {CourseCard} from '~/components/course-card/index.js';
import {Button, ButtonPreset, ButtonType} from '~/components/button/index.js';
import {Editor} from '~/components/text-editor/index.client.js';
import {YemSpinner} from '~/components/yem-spinner/index.js';
import {ModuleService} from '~/services/module.service.server';
import {type TModule} from '~/types/module.type';

type CourseLoaderData = {
	error: string | undefined;
	success: string | undefined;
	course: TPrismaPayloadGetCourseById | undefined;
	courses: TPrismaPayloadGetAllCourses | undefined;
};

export const loader = async ({request, params}: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));
	const {'course-slug': courseSlug} = params;

	try {
		const courseService = new CourseService();
		const {data: course} = await courseService.getBySlug(courseSlug!, userSession.data as TUser);
		const {data: courses} = await courseService.getAll(userSession.get('roles') as string[]);

		return json<CourseLoaderData>({
			course,
			courses,
			error: userSession.get('error') as string | undefined,
			success: userSession.get('success') as string | undefined,
		}, {
			headers: {
				'Set-Cookie': await commitUserSession(userSession), // eslint-disable-line @typescript-eslint/naming-convention
			},
		});
	} catch (error) {
		logger.logError(`Error getting course: ${(error as Error).message}`);
		return json<CourseLoaderData>({
			course: undefined,
			courses: undefined,
			error: 'Erro ao buscar curso',
			success: undefined,
		}, {
			headers: {
				'Set-Cookie': await commitUserSession(userSession), // eslint-disable-line @typescript-eslint/naming-convention
			},
		});
	}
};

export const action = async ({request, params}: ActionFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));
	const {'course-slug': courseSlug} = params;

	try {
		if ((userSession.get('roles') as string[])?.includes('admin')) {
			const formData = await request.formData();

			switch (formData.get('type')) {
				case 'editCourse': {
					const id = formData.get('id') as string;

					const courseToUpdate: TCourse = {
						oldId: formData.get('oldId') as string,
						name: formData.get('name') as string,
						description: formData.get('description') as string,
						content: formData.get('content') as string,
						marketingContent: formData.get('marketingContent') as string,
						videoSourceUrl: formData.get('videoSourceUrl') as string,
						marketingVideoUrl: formData.get('marketingVideoUrl') as string,
						thumbnailUrl: formData.get('thumbnailUrl') as string,
						publicationDate: new Date(formData.get('publicationDate') as string),
						published: Boolean(formData.get('published')),
						isSelling: Boolean(formData.get('isSelling')),
						delegateAuthTo: (formData.get('delegateAuthTo') as string).split(','),
					};

					await new CourseService().update(id, courseToUpdate);

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
						courses: (formData.get('course') as string).split(','),
						publicationDate: new Date(formData.get('publicationDate') as string),
						published: Boolean(formData.get('published')),
					};

					await new ModuleService().create(moduleToCreate);

					userSession.flash('success', `Módulo ${moduleToCreate.name} criado com sucesso`);
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
		userSession.flash('error', 'Erro ao criar curso');
		return redirect(`/admin/courses/${courseSlug}`, {
			headers: {
				'Set-Cookie': await commitUserSession(userSession), // eslint-disable-line @typescript-eslint/naming-convention
			},
		});
	} finally {
		return redirect(`/admin/courses/${courseSlug}`, { // eslint-disable-line no-unsafe-finally
			headers: {
				'Set-Cookie': await commitUserSession(userSession), // eslint-disable-line @typescript-eslint/naming-convention
			},
		});
	}
};

export default function Course() {
	const {
		course,
		courses,
		error,
		success,
	} = useLoaderData<CourseLoaderData>();
	const {'course-slug': courseSlug} = useParams();

	const [courseEditQuill, setCourseEditQuill] = useState<Quill | null>(null); // eslint-disable-line @typescript-eslint/ban-types
	const [courseMktEditQuill, setCourseMktEditQuill] = useState<Quill | null>(null); // eslint-disable-line @typescript-eslint/ban-types
	const [newModuleQuill, setNewModuleQuill] = useState<Quill | null>(null); // eslint-disable-line @typescript-eslint/ban-types
	const [newModuleMktQuill, setNewModuleMktQuill] = useState<Quill | null>(null); // eslint-disable-line @typescript-eslint/ban-types
	const [courseEditQuillContent, setCourseEditQuillContent] = useState(course?.content ?? '');
	const [courseEditMktQuillContent, setCourseEditMktQuillContent] = useState(course?.marketingContent ?? '');
	const [newModuleQuillContent, setNewModuleQuillContent] = useState('');
	const [newModuleQuillMktContent, setNewModuleQuillMktContent] = useState('');
	const [courseEditDialogIsOpen, setCourseEditDialogIsOpen] = useState<boolean>(false);
	const [newModuleDialogIsOpen, setNewModuleDialogIsOpen] = useState<boolean>(false);
	const [coursesValue, setCoursesValue] = useState<Array<{value: string; label: string}>>(course ? [{value: course.id, label: course.name}] : []);
	const [coursesSlug, setCoursesSlug] = useState<Array<{value: string; label: string}>>(course?.delegateAuthTo?.map(course => ({value: course.slug, label: course.name})) ?? []);
	const navigation = useNavigation();
	const isSubmittingAnyForm = navigation.formAction === `/admin/courses/${courseSlug}`;

	const {ops} = course?.content ? JSON.parse(course?.content) as OpIterator : {ops: []};
	const contentConverter = new QuillDeltaToHtmlConverter(ops, {
		multiLineParagraph: false,
	});

	const defaultDate = new Date(course?.publicationDate ?? new Date());
	defaultDate.setHours(defaultDate.getHours() - 3);

	useEffect(() => {
		if (success ?? error) {
			setCourseEditDialogIsOpen(false);
			setNewModuleDialogIsOpen(false);
		}
	}, [success, error]);

	useEffect(() => {
		if (courseEditQuill) {
			courseEditQuill.on('text-change', () => {
				setCourseEditQuillContent(JSON.stringify(courseEditQuill.getContents()));
			});
		}
	}, [courseEditQuill]);

	useEffect(() => {
		if (courseMktEditQuill) {
			courseMktEditQuill.on('text-change', () => {
				setCourseEditMktQuillContent(JSON.stringify(courseMktEditQuill.getContents()));
			});
		}
	}, [courseMktEditQuill]);

	useEffect(() => {
		if (newModuleQuill) {
			newModuleQuill.on('text-change', () => {
				setNewModuleQuillContent(JSON.stringify(newModuleQuill.getContents()));
			});
		}
	}, [newModuleQuill]);

	useEffect(() => {
		if (newModuleMktQuill) {
			newModuleMktQuill.on('text-change', () => {
				setNewModuleQuillMktContent(JSON.stringify(newModuleMktQuill.getContents()));
			});
		}
	}, [newModuleMktQuill]);

	useEffect(() => {
		if (course?.content && courseEditQuill) {
			courseEditQuill.setContents(JSON.parse(course.content) as Delta);
		}
	}, [courseEditQuill]); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		if (course?.marketingContent && courseMktEditQuill) {
			courseMktEditQuill.setContents(JSON.parse(course.marketingContent) as Delta);
		}
	}, [courseMktEditQuill]); // eslint-disable-line react-hooks/exhaustive-deps

	return course && (
		<>
			{(success ?? error) && (
				<p className='mb-4 text-lg'>
					{success ?? error}
				</p>
			)}
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
												value={courseEditQuillContent}
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<ClientOnly fallback={<YemSpinner/>}>
										{() => <Editor setQuill={setCourseEditQuill} placeholder='Adicione aqui o conteúdo do curso, que só aparece para os alunos...'/>}
									</ClientOnly>

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
												value={courseEditMktQuillContent}
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<ClientOnly fallback={<YemSpinner/>}>
										{() => <Editor setQuill={setCourseMktEditQuill} placeholder='Adicione aqui o conteúdo de divulgação do curso, que aparece para quem não é aluno...'/>}
									</ClientOnly>

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

									<RadixForm.Field name='published'>
										<div className='flex items-baseline justify-between'>
											<RadixForm.Label>
												<p>Está publicado</p>
											</RadixForm.Label>
										</div>
										<RadixForm.Control asChild>
											<Switch.Root
												defaultChecked={course.published}
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

									<RadixForm.Field name='delegateAuthTo'>
										<div className='flex items-baseline justify-between'>
											<RadixForm.Label>
												<p>Delegar Autorização Para</p>
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
											defaultValue={coursesSlug}
											options={courses?.map(course => ({value: course.slug, label: course.name}))}
											onChange={selectedOption => {
												setCoursesSlug(selectedOption as Array<{value: string; label: string}>);
											}}
										/>
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
				<p>Está publicado: {course.published ? 'sim' : 'não'}</p>
				<p>Está com matrículas abertas: {course?.isSelling ? 'sim' : 'não'}</p>
				{course.content && (
					<>
						<h2>Conteúdo do curso:</h2>
						{/* eslint-disable-next-line @typescript-eslint/naming-convention, react/no-danger */}
						<div dangerouslySetInnerHTML={{__html: contentConverter.convert()}} className='p-4 rounded-lg border-2 border-mauve-6 dark:border-mauvedark-6 max-w-screen-lg'/>
					</>
				)}
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
												value={newModuleQuillContent}
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<ClientOnly fallback={<YemSpinner/>}>
										{() => <Editor setQuill={setNewModuleQuill} placeholder='Adicione aqui o conteúdo do módulo, que só aparece para os alunos...'/>}
									</ClientOnly>

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
												value={newModuleQuillMktContent}
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<ClientOnly fallback={<YemSpinner/>}>
										{() => <Editor setQuill={setNewModuleMktQuill} placeholder='Adicione aqui o conteúdo de divulgação do módulo, que aparece para quem não é aluno...'/>}
									</ClientOnly>

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

									<RadixForm.Field name='course'>
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
											options={courses?.map(course => ({value: course.id, label: course.name}))}
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
												disabled={isSubmittingAnyForm}
												type='datetime-local'
												min={3}
												className='w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-none'
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<RadixForm.Field name='published'>
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
						<CourseCard key={module.id} course={module} to={`./${module.slug}`}/>
					))}
				</div>

			</div>
		</>
	);
}
