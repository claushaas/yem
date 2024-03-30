import {
	type ActionFunctionArgs, json, type LoaderFunctionArgs, redirect,
} from '@remix-run/node';
import {Form, useLoaderData, useNavigation} from '@remix-run/react';
import {QuillDeltaToHtmlConverter} from 'quill-delta-to-html';
import {type Delta, type OpIterator} from 'quill/core';
import * as Dialog from '@radix-ui/react-dialog';
import * as RadixForm from '@radix-ui/react-form';
import type Quill from 'quill';
import {useEffect, useState} from 'react';
import {ClientOnly} from 'remix-utils/client-only';
import * as Switch from '@radix-ui/react-switch';
import {XMarkIcon} from '@heroicons/react/24/outline';
import {CourseService} from '#/services/course.service';
import {commitUserSession, getUserSession} from '~/utils/session.server';
import {type TUser} from '#/types/user.type';
import {logger} from '#/utils/logger.util';
import {type TPrismaPayloadGetCourseById} from '#/types/course.type';
import {CourseCard} from '~/components/course-card/index.js';
import {Button, ButtonPreset, ButtonType} from '~/components/button/index.js';
import {Editor} from '~/components/text-editor/index.client.js';
import {YemSpinner} from '~/components/yem-spinner/index.js';

type CourseLoaderData = {
	error: string | undefined;
	success: string | undefined;
	course: TPrismaPayloadGetCourseById | undefined;
};

export const loader = async ({request, params}: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));
	const {'course-id': courseId} = params;

	try {
		const {data: course} = await new CourseService().getById(courseId!, userSession.data as TUser);

		return json<CourseLoaderData>({
			course,
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
	const {'course-id': courseId} = params;

	try {
		if ((userSession.get('roles') as string[])?.includes('admin')) {
			const formData = await request.formData();

			const courseToUpdate = {
				name: formData.get('name') as string,
				description: formData.get('description') as string,
				content: formData.get('content') as string,
				videoSourceUrl: formData.get('videoSourceUrl') as string,
				thumbnailUrl: formData.get('thumbnailUrl') as string,
				publicationDate: new Date(formData.get('publicationDate') as string),
				published: Boolean(formData.get('published')),
				isSelling: Boolean(formData.get('isSelling')),
			};

			await new CourseService().update(courseId!, courseToUpdate);

			userSession.flash('success', 'Curso atualizado com sucesso');

			return redirect(`/admin/courses/${courseId}`, {
				headers: {
					'Set-Cookie': await commitUserSession(userSession), // eslint-disable-line @typescript-eslint/naming-convention
				},
			});
		}

		userSession.flash('error', 'Você não tem permissão para editar cursos');
		return redirect(`/admin/courses/${courseId}`, {
			headers: {
				'Set-Cookie': await commitUserSession(userSession), // eslint-disable-line @typescript-eslint/naming-convention
			},
		});
	} catch (error) {
		logger.logError(`Error creating course: ${(error as Error).message}`);
		userSession.flash('error', 'Erro ao criar curso');
		return redirect(`/admin/courses/${courseId}`, {
			headers: {
				'Set-Cookie': await commitUserSession(userSession), // eslint-disable-line @typescript-eslint/naming-convention
			},
		});
	}
};

export default function Course() {
	const {
		course,
		error,
		success,
	} = useLoaderData<CourseLoaderData>();

	const [quill, setQuill] = useState<Quill | null>(null); // eslint-disable-line @typescript-eslint/ban-types
	const [content, setContent] = useState(course?.content ?? '');
	const [open, setOpen] = useState<boolean>(false);
	const navigation = useNavigation();
	const isSubmitting = navigation.formAction === '/admin/courses';

	const {ops} = course?.content ? JSON.parse(course?.content) as OpIterator : {ops: []};
	const contentConverter = new QuillDeltaToHtmlConverter(ops, {
		multiLineParagraph: false,
	});

	const defaultDate = new Date(course?.publicationDate ?? new Date());
	defaultDate.setHours(defaultDate.getHours() - 3);

	useEffect(() => {
		if (success) {
			setOpen(false);
		}
	}, [success]);

	useEffect(() => {
		if (quill) {
			quill.on('text-change', () => {
				setContent(JSON.stringify(quill.getContents()));
			});
		}
	}, [quill]);

	useEffect(() => {
		if (course?.content && quill) {
			quill.setContents(JSON.parse(course.content) as Delta);
		}
	}, [quill]); // eslint-disable-line react-hooks/exhaustive-deps

	return course && (
		<>
			{(success ?? error) && (
				<p className='mb-4 text-lg'>
					{success ?? error}
				</p>
			)}
			<Dialog.Root open={open} onOpenChange={setOpen}>
				<Dialog.Trigger asChild>
					<div className='w-fit'>
						<Button
							preset={ButtonPreset.Primary}
							text='Editar o Curso'
							type={ButtonType.Button}
						/>
					</div>
				</Dialog.Trigger>

				<Dialog.Portal>
					<Dialog.Overlay className='bg-mauvea-12 fixed inset-0'/>

					<Dialog.Content className='fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] p-4 max-w-screen-lg w-[90%] bg-mauve-2 dark:bg-mauvedark-2 rounded-xl overflow-y-auto max-h-[90%]'>
						<div>
							<Dialog.Title asChild>
								<h1 className='mb-4'>
									{`Editar o Curso ${course.name}`}
								</h1>
							</Dialog.Title>
							<div>
								<RadixForm.Root asChild>
									<Form method='post' action={`/admin/courses/${course.id}`} className='flex flex-col gap-3'>

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
													disabled={isSubmitting}
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
													disabled={isSubmitting}
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
													disabled={isSubmitting}
													type='text'
													min={8}
													className='hidden'
													value={content}
												/>
											</RadixForm.Control>
										</RadixForm.Field>

										<ClientOnly fallback={<YemSpinner/>}>
											{() => <Editor setQuill={setQuill} placeholder='Adicione aqui o conteúdo do curso, que só aparece para os alunos...'/>}
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
													disabled={isSubmitting}
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
													disabled={isSubmitting}
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
													disabled={isSubmitting}
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
													disabled={isSubmitting}
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
													disabled={isSubmitting}
													className='w-[42px] h-[25px] bg-blacka-6 rounded-full relative shadow-[0_2px_10px] shadow-blacka-4 focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-black outline-none cursor-default'
												>
													<Switch.Thumb
														className='block w-[21px] h-[21px] bg-white rounded-full shadow-[0_2px_2px] shadow-blackA4 transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px]'
													/>
												</Switch.Root>
											</RadixForm.Control>
										</RadixForm.Field>

										<RadixForm.Submit asChild>
											<Button key='Editar o Curso' isDisabled={isSubmitting} className='m-auto mt-2' text='Editar o Curso' preset={ButtonPreset.Primary} type={ButtonType.Submit}/>
										</RadixForm.Submit>

										{isSubmitting && <YemSpinner/>}

									</Form>
								</RadixForm.Root>

							</div>
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
				<h1>{course.name}</h1>
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
				<h2>Módulos</h2>
				<div>
					{course.modules.map(module => (
						<CourseCard key={module.id} course={module} to={`./${module.id}`}/>
					))}
				</div>
			</div>
		</>
	);
}
