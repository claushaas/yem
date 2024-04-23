import {
	type ActionFunctionArgs, json, type LoaderFunctionArgs, redirect,
} from '@remix-run/node';
import {
	Form, type MetaFunction, useLoaderData, useNavigation, useParams,
} from '@remix-run/react';
import {useEffect, useState} from 'react';
import type Quill from 'quill';
import {type Delta, type OpIterator} from 'quill/core';
import {QuillDeltaToHtmlConverter} from 'quill-delta-to-html';
import * as Dialog from '@radix-ui/react-dialog';
import * as RadixForm from '@radix-ui/react-form';
import * as Switch from '@radix-ui/react-switch';
import * as RadixSelect from '@radix-ui/react-select';
import {
	XMarkIcon, ChevronDownIcon, ChevronUpIcon, CheckIcon,
} from '@heroicons/react/24/outline';
import Select from 'react-select';
import {ClientOnly} from 'remix-utils/client-only';
import {logger} from '~/utils/logger.util';
import {commitUserSession, getUserSession} from '~/utils/session.server';
import {ModuleService} from '~/services/module.service.server';
import {LessonService} from '~/services/lesson.service.server';
import {type TUser} from '~/types/user.type';
import {type TPrismaPayloadGetModulesList, type TModule, type TPrismaPayloadGetModuleBySlug} from '~/types/module.type';
import {CourseCard} from '~/components/generic-entity-card.js';
import {Button, ButtonPreset, ButtonType} from '~/components/button.js';
import {Editor} from '~/components/text-editor.client.js';
import {YemSpinner} from '~/components/yem-spinner.js';
import {type TLesson, type TLessonType} from '~/types/lesson.type';
import {type TTags, type TPrismaPayloadGetAllTags, type TTag} from '~/types/tag.type';
import {TagService} from '~/services/tag.service.server';

export const meta: MetaFunction<typeof loader> = ({data}) => [
	{title: `${data?.module?.module.name} - Yoga em Movimento`},
	{name: 'description', content: data?.module?.module.description},
	{name: 'robots', content: 'noindex, nofollow'},
	...data!.meta,
];

type ModuleLoaderData = {
	error: string | undefined;
	success: string | undefined;
	module: TPrismaPayloadGetModuleBySlug | undefined;
	modules: TPrismaPayloadGetModulesList | undefined;
	tags: TPrismaPayloadGetAllTags | undefined;
	meta: Array<{tagName: string; rel: string; href: string}>;
};

export const loader = async ({request, params}: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));
	const {
		'course-slug': courseSlug,
		'module-slug': moduleSlug,
	} = params;

	const meta = [
		{tagName: 'link', rel: 'canonical', href: new URL(`/admin/courses/${courseSlug}/${moduleSlug}`, request.url).toString()},
	];

	const moduleService = new ModuleService();

	try {
		const {data: module} = await moduleService.getBySlug(courseSlug!, moduleSlug!, userSession.data as TUser);
		const {data: modules} = await moduleService.getAllForAdmin(userSession.data as TUser);
		const {data: tags} = await new TagService().getAll();

		return json<ModuleLoaderData>({
			module,
			modules,
			tags,
			error: userSession.get('error') as string | undefined,
			success: userSession.get('success') as string | undefined,
			meta,
		}, {
			headers: {
				'Set-Cookie': await commitUserSession(userSession), // eslint-disable-line @typescript-eslint/naming-convention
			},
		});
	} catch (error) {
		logger.logError(`Error getting module: ${(error as Error).message}`);
		return json<ModuleLoaderData>({
			module: undefined,
			modules: undefined,
			tags: undefined,
			error: (error as Error).message,
			success: undefined,
			meta,
		}, {
			headers: {
				'Set-Cookie': await commitUserSession(userSession), // eslint-disable-line @typescript-eslint/naming-convention
			},
		});
	}
};

export const action = async ({request, params}: ActionFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));
	const {'course-slug': courseSlug, 'module-slug': moduleSlug} = params;

	try {
		if ((userSession.get('roles') as string[])?.includes('admin')) {
			const formData = await request.formData();

			switch (formData.get('formType')) {
				case 'editModule': {
					const id = formData.get('id') as string;

					const moduleToUpdate: TModule = {
						oldId: formData.get('oldId') as string,
						name: formData.get('name') as string,
						description: formData.get('description') as string,
						content: formData.get('content') as string,
						marketingContent: formData.get('marketingContent') as string,
						videoSourceUrl: formData.get('videoSourceUrl') as string,
						marketingVideoUrl: formData.get('marketingVideoUrl') as string,
						thumbnailUrl: formData.get('thumbnailUrl') as string,
						isLessonsOrderRandom: Boolean(formData.get('isLessonsOrderRandom')),
					};

					await new ModuleService().update(id, moduleToUpdate);

					userSession.flash('success', `Módulo ${moduleToUpdate.name} atualizado com sucesso`);
					break;
				}

				case 'newLesson': {
					const newLesson: TLesson = {
						oldId: formData.get('oldId') as string,
						name: formData.get('name') as string,
						description: formData.get('description') as string,
						content: formData.get('content') as string,
						marketingContent: formData.get('marketingContent') as string,
						type: formData.get('type') as TLessonType,
						videoSourceUrl: formData.get('videoSourceUrl') as string,
						marketingVideoUrl: formData.get('marketingVideoUrl') as string,
						duration: Number(formData.get('duration')),
						thumbnailUrl: formData.get('thumbnailUrl') as string,
						modules: (formData.get('modules') as string).split(','),
						publicationDate: new Date(formData.get('publicationDate') as string),
						isPublished: Boolean(formData.get('isPublished')),
						tags: JSON.parse(formData.get('tags') as string) as TTags,
						order: Number(formData.get('order')),
					};

					await new LessonService().create(newLesson);

					userSession.flash('success', `Nova aula ${newLesson.name} criada com sucesso`);
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
		return redirect(`/admin/courses/${courseSlug}/${moduleSlug}`, {
			headers: {
				'Set-Cookie': await commitUserSession(userSession), // eslint-disable-line @typescript-eslint/naming-convention
			},
		});
	}

	return redirect(`/admin/courses/${courseSlug}/${moduleSlug}`, {
		headers: {
			'Set-Cookie': await commitUserSession(userSession), // eslint-disable-line @typescript-eslint/naming-convention
		},
	});
};

export default function Module() {
	const {
		module,
		modules,
		tags: rawTags,
		error,
		success,
	} = useLoaderData<ModuleLoaderData>();

	const {
		'course-slug': courseSlug,
		'module-slug': moduleSlug,
	} = useParams();

	const tags: Array<{value: TTag; label: string}> = rawTags ? rawTags.map(tag => ({value: [tag.tagOptionName, tag.tagValueName], label: `${tag.tagOptionName}: ${tag.tagValueName}`})) : [];

	const [moduleEditQuill, setModuleEditQuill] = useState<Quill | null>(null); // eslint-disable-line @typescript-eslint/ban-types
	const [moduleMktEditQuill, setModuleMktEditQuill] = useState<Quill | null>(null); // eslint-disable-line @typescript-eslint/ban-types
	const [newLessonQuill, setNewLessonQuill] = useState<Quill | null>(null); // eslint-disable-line @typescript-eslint/ban-types
	const [newLessonMktQuill, setNewLessonMktQuill] = useState<Quill | null>(null); // eslint-disable-line @typescript-eslint/ban-types
	const [moduleEditQuillContent, setModuleEditQuillContent] = useState(module?.module.content ?? '');
	const [moduleEditQuillMktContent, setModuleEditQuillMktContent] = useState(module?.module.marketingContent ?? '');
	const [newLessonQuillContent, setNewLessonQuillContent] = useState('');
	const [newLessonQuillMktContent, setNewLessonQuillMktContent] = useState('');
	const [moduleEditDialogIsOpen, setModuleEditDialogIsOpen] = useState(false);
	const [newLessonDialogIsOpen, setNewLessonDialogIsOpen] = useState(false);
	const [modulesValue, setModulesValue] = useState<Array<{value: string; label: string}>>(module ? [{value: module.module.id, label: module.module.name}] : []);
	const [tagsValue, setTagsValue] = useState<Array<{value: TTag; label: string}>>([]);
	const navigation = useNavigation();
	const isSubmittingAnyForm = navigation.formAction === `/admin/courses/${courseSlug}/${moduleSlug}`;

	const {ops} = module?.module.content ? JSON.parse(module.module.content) as OpIterator : {ops: []};
	const contentConverter = new QuillDeltaToHtmlConverter(ops, {
		multiLineParagraph: false,
	});

	const defaultDate = new Date(module?.publicationDate ?? new Date());
	defaultDate.setHours(defaultDate.getHours() - 3);

	useEffect(() => {
		if (success) {
			setModuleEditDialogIsOpen(false);
			setNewLessonDialogIsOpen(false);
		}
	}, [success]);

	useEffect(() => {
		if (moduleEditQuill) {
			moduleEditQuill.on('text-change', () => {
				setModuleEditQuillContent(JSON.stringify(moduleEditQuill.getContents()));
			});
		}
	}, [moduleEditQuill]);

	useEffect(() => {
		if (moduleMktEditQuill) {
			moduleMktEditQuill.on('text-change', () => {
				setModuleEditQuillMktContent(JSON.stringify(moduleMktEditQuill.getContents()));
			});
		}
	}, [moduleMktEditQuill]);

	useEffect(() => {
		if (newLessonQuill) {
			newLessonQuill.on('text-change', () => {
				setNewLessonQuillContent(JSON.stringify(newLessonQuill.getContents()));
			});
		}
	}, [newLessonQuill]);

	useEffect(() => {
		if (newLessonMktQuill) {
			newLessonMktQuill.on('text-change', () => {
				setNewLessonQuillMktContent(JSON.stringify(newLessonMktQuill.getContents()));
			});
		}
	}, [newLessonMktQuill]);

	useEffect(() => {
		if (module?.module.content && moduleEditQuill) {
			moduleEditQuill.setContents(JSON.parse(module.module.content) as Delta);
		}
	}, [moduleEditQuill]); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		if (module?.module.marketingContent && moduleMktEditQuill) {
			moduleMktEditQuill.setContents(JSON.parse(module.module.marketingContent) as Delta);
		}
	}, [moduleMktEditQuill]); // eslint-disable-line react-hooks/exhaustive-deps

	return module && (
		<>
			{(success ?? error) && (
				<p className='mb-4 text-lg'>
					{success ?? error}
				</p>
			)}

			<Dialog.Root open={moduleEditDialogIsOpen} onOpenChange={setModuleEditDialogIsOpen}>
				<div className='flex items-center gap-5'>
					<h1>{module.module.name}</h1>
					<Dialog.Trigger asChild>
						<div className='w-fit'>
							<Button
								preset={ButtonPreset.Primary}
								text='Editar o Módulo'
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
								{`Editar o Módulo ${module.module.name}`}
							</h1>
						</Dialog.Title>

						<RadixForm.Root asChild>
							<Form method='post' action={`/admin/courses/${courseSlug}/${moduleSlug}`} className='flex flex-col gap-3'>

								<RadixForm.Field name='oldId'>
									<div className='flex items-baseline justify-between'>
										<RadixForm.Label>
											<p>ID da Antiga Plataforma</p>
										</RadixForm.Label>
									</div>
									<RadixForm.Control asChild>
										<input
											defaultValue={module.module.oldId ?? ''}
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
											defaultValue={module.module.name}
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
											defaultValue={module.module.description ?? ''}
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
											value={moduleEditQuillContent}
										/>
									</RadixForm.Control>
								</RadixForm.Field>

								<ClientOnly fallback={<YemSpinner/>}>
									{() => <Editor setQuill={setModuleEditQuill} placeholder='Adicione aqui o conteúdo do módulo, que só aparece para os alunos...'/>}
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
											value={moduleEditQuillMktContent}
										/>
									</RadixForm.Control>
								</RadixForm.Field>

								<ClientOnly fallback={<YemSpinner/>}>
									{() => <Editor setQuill={setModuleMktEditQuill} placeholder='Adicione aqui o conteúdo de divulgação do módulo, que aparece para quem não é aluno...'/>}
								</ClientOnly>

								<RadixForm.Field name='videoSourceUrl'>
									<div className='flex items-baseline justify-between'>
										<RadixForm.Label>
											<p>Vídeo</p>
										</RadixForm.Label>
									</div>
									<RadixForm.Control asChild>
										<input
											defaultValue={module.module.videoSourceUrl ?? ''}
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
											defaultValue={module.module.marketingVideoUrl ?? ''}
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
											defaultValue={module.module.thumbnailUrl}
											disabled={isSubmittingAnyForm}
											type='text'
											min={3}
											className='w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-none'
										/>
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
											defaultChecked={module.module.isLessonsOrderRandom}
											disabled={isSubmittingAnyForm}
											className='w-[42px] h-[25px] bg-blacka-6 rounded-full relative shadow-[0_2px_10px] shadow-blacka-4 focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-black outline-none cursor-default'
										>
											<Switch.Thumb
												className='block w-[21px] h-[21px] bg-white rounded-full shadow-[0_2px_2px] shadow-blackA4 transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px]'
											/>
										</Switch.Root>
									</RadixForm.Control>
								</RadixForm.Field>

								<RadixForm.Field name='formType' className='hidden'>
									<RadixForm.Control asChild>
										<input
											disabled={isSubmittingAnyForm}
											type='text'
											value='editModule'
										/>
									</RadixForm.Control>
								</RadixForm.Field>

								<RadixForm.Field name='id' className='hidden'>
									<RadixForm.Control asChild>
										<input
											disabled={isSubmittingAnyForm}
											type='text'
											value={module.module.id}
										/>
									</RadixForm.Control>
								</RadixForm.Field>

								<RadixForm.Submit asChild>
									<Button isDisabled={isSubmittingAnyForm} className='m-auto mt-2' text='Editar o Módulo' preset={ButtonPreset.Primary} type={ButtonType.Submit}/>
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

			<div>
				<h4>{module.module.description}</h4>
				<p>Data de publicação: {new Date(module.publicationDate).toLocaleString('pt-BR')}</p>
				<p>Está publicado: {module.isPublished ? 'sim' : 'não'}</p>
				{module.module.content && (
					<>
						<h2>Conteúdo do Módulo:</h2>
						{/* eslint-disable-next-line @typescript-eslint/naming-convention, react/no-danger */}
						<div dangerouslySetInnerHTML={{__html: contentConverter.convert()}} className='p-4 rounded-lg border-2 border-mauve-6 dark:border-mauvedark-6 max-w-screen-lg'/>
					</>
				)}
			</div>
			<div>
				<Dialog.Root open={newLessonDialogIsOpen} onOpenChange={setNewLessonDialogIsOpen}>
					<div className='flex items-center gap-5'>
						<h2>Aulas</h2>
						<Dialog.Trigger asChild>
							<div className='w-fit'>
								<Button
									preset={ButtonPreset.Primary}
									text='Adicionar Nova Aula'
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
									Adicionar Nova Aula
								</h1>
							</Dialog.Title>

							<RadixForm.Root asChild>
								<Form method='post' action={`/admin/courses/${courseSlug}/${moduleSlug}`} className='flex flex-col gap-3'>

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

									<RadixForm.Field name='type'>
										<div className='flex items-baseline justify-between'>
											<RadixForm.Label>
												<p>Tipo da aula</p>
											</RadixForm.Label>
										</div>
										<RadixSelect.Root name='type'>
											<RadixSelect.Trigger
												className='inline-flex items-center justify-center rounded px-[15px] text-[13px] leading-none h-[35px] gap-[5px] bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 shadow-[0_2px_10px] shadow-black/10 hover:bg-mauve3 focus:shadow-[0_0_0_2px] focus:shadow-black data-[placeholder]:text-violet9 outline-none'
												aria-label='Tipo da aula'
											>
												<RadixSelect.Value placeholder='Escolha o tipo da aula'/>
												<RadixSelect.Icon>
													<ChevronDownIcon className='size-4'/>
												</RadixSelect.Icon>
											</RadixSelect.Trigger>

											<RadixSelect.Portal>
												<RadixSelect.Content className='overflow-hidden bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 rounded-md shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)]'>
													<RadixSelect.ScrollUpButton>
														<ChevronUpIcon className='size-4'/>
													</RadixSelect.ScrollUpButton>

													<RadixSelect.Viewport className='p-[5px]'>
														<RadixSelect.Group>

															<RadixSelect.SelectItem value='video' className='text-[13px] leading-none text-violet11 rounded-[3px] flex items-center h-[25px] pr-[35px] pl-[25px] relative select-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:outline-none data-[highlighted]:bg-violet9 data-[highlighted]:text-violet1'>
																<RadixSelect.SelectItemText>
																	<p>Vídeo</p>
																</RadixSelect.SelectItemText>
																<RadixSelect.ItemIndicator className='absolute left-0 w-[25px] inline-flex items-center justify-center'>
																	<CheckIcon/>
																</RadixSelect.ItemIndicator>
															</RadixSelect.SelectItem>

															<RadixSelect.SelectItem value='text' className='text-[13px] leading-none text-violet11 rounded-[3px] flex items-center h-[25px] pr-[35px] pl-[25px] relative select-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:outline-none data-[highlighted]:bg-violet9 data-[highlighted]:text-violet1'>
																<RadixSelect.SelectItemText>
																	<p>Texto</p>
																</RadixSelect.SelectItemText>
																<RadixSelect.ItemIndicator className='absolute left-0 w-[25px] inline-flex items-center justify-center'>
																	<CheckIcon/>
																</RadixSelect.ItemIndicator>
															</RadixSelect.SelectItem>

															<RadixSelect.SelectItem value='courseWare' className='text-[13px] leading-none text-violet11 rounded-[3px] flex items-center h-[25px] pr-[35px] pl-[25px] relative select-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:outline-none data-[highlighted]:bg-violet9 data-[highlighted]:text-violet1'>
																<RadixSelect.SelectItemText>
																	<p>Material Didático</p>
																</RadixSelect.SelectItemText>
																<RadixSelect.ItemIndicator className='absolute left-0 w-[25px] inline-flex items-center justify-center'>
																	<CheckIcon/>
																</RadixSelect.ItemIndicator>
															</RadixSelect.SelectItem>

														</RadixSelect.Group>
													</RadixSelect.Viewport>

													<RadixSelect.ScrollDownButton>
														<ChevronDownIcon className='size-4'/>
													</RadixSelect.ScrollDownButton>
												</RadixSelect.Content>
											</RadixSelect.Portal>
										</RadixSelect.Root>
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
												value={newLessonQuillContent}
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<ClientOnly fallback={<YemSpinner/>}>
										{() => <Editor setQuill={setNewLessonQuill} placeholder='Adicione aqui o conteúdo da aula, que só aparece para os alunos...'/>}
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
												value={newLessonQuillMktContent}
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<ClientOnly fallback={<YemSpinner/>}>
										{() => <Editor setQuill={setNewLessonMktQuill} placeholder='Adicione aqui o conteúdo de divulgação da aula, que aparece para quem não é aluno...'/>}
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

									<RadixForm.Field name='duration'>
										<div className='flex items-baseline justify-between'>
											<RadixForm.Label>
												<p>Duração do vídeo (em minutos)</p>
											</RadixForm.Label>
										</div>
										<RadixForm.Control asChild>
											<input
												disabled={isSubmittingAnyForm}
												type='number'
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

									<RadixForm.Field name='modules'>
										<div className='flex items-baseline justify-between'>
											<RadixForm.Label>
												<p>Módulos</p>
											</RadixForm.Label>
										</div>
										<RadixForm.Control asChild>
											<input
												disabled={isSubmittingAnyForm}
												type='text'
												className='hidden'
												value={modulesValue.map(course => course.value).join(',')}
											/>
										</RadixForm.Control>
										<Select
											isMulti
											value={modulesValue}
											options={modules?.map(module => ({value: module.slug, label: module.name}))}
											onChange={selectedOption => {
												setModulesValue(selectedOption as Array<{value: string; label: string}>);
											}}
										/>
									</RadixForm.Field>

									<RadixForm.Field name='tags'>
										<div className='flex items-baseline justify-between'>
											<RadixForm.Label>
												<p>Tags</p>
											</RadixForm.Label>
										</div>
										<RadixForm.Control asChild>
											<input
												disabled={isSubmittingAnyForm}
												type='text'
												className='hidden'
												value={JSON.stringify(tagsValue.map(tag => tag.value))}
											/>
										</RadixForm.Control>
										<Select
											isMulti
											value={tagsValue}
											options={tags}
											onChange={selectedOption => {
												setTagsValue(selectedOption as Array<{value: TTag; label: string}>);
											}}
										/>
									</RadixForm.Field>

									<RadixForm.Field name='formType' className='hidden'>
										<RadixForm.Control asChild>
											<input
												disabled={isSubmittingAnyForm}
												type='text'
												value='newLesson'
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
												<p>Está publicada</p>
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
												<p>Posição da aula dentro do módulo</p>
											</RadixForm.Label>
										</div>
										<RadixForm.Control asChild>
											<input
												required
												disabled={isSubmittingAnyForm}
												type='text'
												className='w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-none'
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<RadixForm.Submit asChild>
										<Button isDisabled={isSubmittingAnyForm} className='m-auto mt-2' text='Criar Nova Aula' preset={ButtonPreset.Primary} type={ButtonType.Submit}/>
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
					{module.module.lessons.map(lesson => (
						<CourseCard key={lesson.lesson.id} course={lesson.lesson} to={`./${lesson.lesson.slug}`}/>
					))}
				</div>
			</div>
		</>
	);
}
