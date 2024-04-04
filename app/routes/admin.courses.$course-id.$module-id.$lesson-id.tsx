import {
	type ActionFunctionArgs, json, type LoaderFunctionArgs, redirect,
} from '@remix-run/node';
import {
	Form, useLoaderData, useNavigation, useParams,
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
import {ClientOnly} from 'remix-utils/client-only';
import {LessonService} from '~/services/lesson.service';
import {type TUser} from '~/types/user.type';
import {logger} from '~/utils/logger.util';
import {commitUserSession, getUserSession} from '~/utils/session.server';
import {type TLessonType, type TPrismaPayloadGetLessonById} from '~/types/lesson.type';
import {Button, ButtonPreset, ButtonType} from '~/components/button/index.js';
import {Editor} from '~/components/text-editor/index.client.js';
import {YemSpinner} from '~/components/yem-spinner/index.js';

type LessonLoaderData = {
	error: string | undefined;
	success: string | undefined;
	lesson: TPrismaPayloadGetLessonById | undefined;
};

export const loader = async ({request, params}: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));
	const {
		'course-id': courseId,
		'module-id': moduleId,
		'lesson-id': lessonId,
	} = params;

	try {
		const {data: lesson} = await new LessonService().getById(courseId!, moduleId!, lessonId!, userSession.data as TUser);

		return json<LessonLoaderData>({
			lesson,
			error: userSession.get('error') as string | undefined,
			success: userSession.get('success') as string | undefined,
		}, {
			headers: {
				'Set-Cookie': await commitUserSession(userSession), // eslint-disable-line @typescript-eslint/naming-convention
			},
		});
	} catch (error) {
		logger.logError(`Error fetching lesson: ${(error as Error).message}`);
		return json<LessonLoaderData>({
			lesson: undefined,
			error: (error as Error).message,
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
	const {
		'course-id': courseId,
		'module-id': moduleId,
		'lesson-id': lessonId,
	} = params;

	if ((userSession.get('roles') as string[])?.includes('admin')) {
		try {
			const formData = await request.formData();

			const lessonToUpdate = {
				name: formData.get('name') as string,
				description: formData.get('description') as string,
				type: formData.get('type') as TLessonType,
				content: formData.get('content') as string,
				videoSourceUrl: formData.get('videoSourceUrl') as string,
				duration: Number(formData.get('duration')),
				thumbnailUrl: formData.get('thumbnailUrl') as string,
				modules: (formData.get('modules') as string).split(','),
				publicationDate: new Date(formData.get('publicationDate') as string),
				published: formData.get('published') === 'on',
			};

			await new LessonService().update(lessonId!, lessonToUpdate);

			userSession.flash('success', 'Aula criada com sucesso');
		} catch (error) {
			logger.logError(`Error updating lesson: ${(error as Error).message}`);
			userSession.flash('error', (error as Error).message);
			return redirect(`/admin/courses/${courseId}/${moduleId}/${lessonId}`, {
				headers: {
					'Set-Cookie': await commitUserSession(userSession), // eslint-disable-line @typescript-eslint/naming-convention
				},
			});
		} finally {
			return redirect(`/admin/courses/${courseId}/${moduleId}/${lessonId}`, { // eslint-disable-line no-unsafe-finally
				headers: {
					'Set-Cookie': await commitUserSession(userSession), // eslint-disable-line @typescript-eslint/naming-convention
				},
			});
		}
	}
};

export default function Lesson() {
	const {
		error,
		success,
		lesson,
	} = useLoaderData<LessonLoaderData>();

	const {
		'course-id': courseId,
		'module-id': moduleId,
		'lesson-id': lessonId,
	} = useParams();

	const [lessonEditQuill, setLessonEditQuill] = useState<Quill | null>(null); // eslint-disable-line @typescript-eslint/ban-types
	const [lessonEditQuillContent, setLessonEditQuillContent] = useState(lesson?.content ?? '');
	const [lessonEditDialogIsOpen, setLessonEditDialogIsOpen] = useState(false);
	const navigation = useNavigation();
	const isSubmittingAnyForm = navigation.formAction === `/admin/courses/${courseId}/${moduleId}/${lessonId}`;

	const {ops} = lesson?.content ? JSON.parse(lesson.content) as OpIterator : {ops: []};
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

	useEffect(() => {
		if (lessonEditQuill) {
			lessonEditQuill.on('text-change', () => {
				setLessonEditQuillContent(JSON.stringify(lessonEditQuill.getContents()));
			});
		}
	}, [lessonEditQuill]);

	useEffect(() => {
		if (lesson?.content && lessonEditQuill) {
			lessonEditQuill.setContents(JSON.parse(lesson.content) as Delta);
		}
	}, [lessonEditQuill]); // eslint-disable-line react-hooks/exhaustive-deps

	return lesson && (
		<>
			{(success ?? error) && (
				<p className='mb-4 text-lg'>
					{success ?? error}
				</p>
			)}

			<Dialog.Root open={lessonEditDialogIsOpen} onOpenChange={setLessonEditDialogIsOpen}>
				<div className='flex items-center gap-5'>
					<h1>{lesson.name}</h1>
					<Dialog.Trigger asChild>
						<div className='w-fit'>
							<Button
								preset={ButtonPreset.Primary}
								text='Editar a Aula'
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
								{`Editar a Aula ${lesson.name}`}
							</h1>
						</Dialog.Title>

						<RadixForm.Root asChild>
							<Form method='post' action={`/admin/courses/${courseId}/${moduleId}/${lessonId}`} className='flex flex-col gap-3'>

								<RadixForm.Field name='name'>
									<div className='flex items-baseline justify-between'>
										<RadixForm.Label>
											<p>Nome</p>
										</RadixForm.Label>
									</div>
									<RadixForm.Control asChild>
										<input
											required
											defaultValue={lesson.name}
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
											defaultValue={lesson.description ?? ''}
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
									<RadixSelect.Root name='type' defaultValue={lesson.type}>
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
											value={lessonEditQuillContent}
										/>
									</RadixForm.Control>
								</RadixForm.Field>

								<ClientOnly fallback={<YemSpinner/>}>
									{() => <Editor setQuill={setLessonEditQuill} placeholder='Adicione aqui o conteúdo da aula, que só aparece para os alunos...'/>}
								</ClientOnly>

								<RadixForm.Field name='videoSourceUrl'>
									<div className='flex items-baseline justify-between'>
										<RadixForm.Label>
											<p>Vídeo</p>
										</RadixForm.Label>
									</div>
									<RadixForm.Control asChild>
										<input
											defaultValue={lesson.videoSourceUrl ?? ''}
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
											defaultValue={Number(lesson.duration)}
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
											defaultValue={lesson.thumbnailUrl}
											disabled={isSubmittingAnyForm}
											type='text'
											min={3}
											className='w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-none'
										/>
									</RadixForm.Control>
								</RadixForm.Field>

								<RadixForm.Field name='modules' className='hidden'>
									<RadixForm.Control asChild>
										<input
											disabled={isSubmittingAnyForm}
											type='text'
											value={[moduleId!]}
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
											defaultChecked={lesson.published}
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
									<Button isDisabled={isSubmittingAnyForm} className='m-auto mt-2' text='Editar a Aula' preset={ButtonPreset.Primary} type={ButtonType.Submit}/>
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
				<h4>{lesson.description}</h4>
				<p>Data de publicação: {new Date(lesson.publicationDate).toLocaleString('pt-BR')}</p>
				<p>Está publicado: {lesson.published ? 'sim' : 'não'}</p>
				{lesson.content && (
					<>
						<h2>Conteúdo da Aula:</h2>
						{/* eslint-disable-next-line @typescript-eslint/naming-convention, react/no-danger */}
						<div dangerouslySetInnerHTML={{__html: contentConverter.convert()}} className='p-4 rounded-lg border-2 border-mauve-6 dark:border-mauvedark-6 max-w-screen-lg'/>
					</>
				)}
			</div>
		</>
	);
}
