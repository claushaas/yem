import {XMarkIcon} from '@heroicons/react/24/outline';
import * as Dialog from '@radix-ui/react-dialog';
import {
	type ActionFunctionArgs, json, type LoaderFunctionArgs, redirect,
} from '@remix-run/node';
import {Form, useLoaderData, useNavigation} from '@remix-run/react';
import * as RadixForm from '@radix-ui/react-form';
import type Quill from 'quill';
import {useEffect, useState} from 'react';
import {ClientOnly} from 'remix-utils/client-only';
import * as Switch from '@radix-ui/react-switch';
import {CourseService} from '#/services/course.service';
import {Button, ButtonPreset, ButtonType} from '~/components/button/index.js';
import {commitUserSession, getUserSession} from '~/utils/session.server.js';
import {logger} from '#/utils/logger.util.js';
import {CourseCard} from '~/components/course-card/index.js';
import {Editor} from '~/components/text-editor/index.client.js';
import {YemSpinner} from '~/components/yem-spinner/index.js';
import {type TUserRoles} from '#/types/user.type';
import {type TPrismaPayloadGetAllCourses} from '#/types/course.type';

type CoursesLoaderData = {
	error: string | undefined;
	success: string | undefined;
	courses: TPrismaPayloadGetAllCourses;
};

export const loader = async ({request}: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));

	try {
		const {data: courses} = await new CourseService().getAll(userSession.get('roles') as TUserRoles);
		return json<CoursesLoaderData>({
			error: userSession.get('error') as string | undefined,
			success: userSession.get('success') as string | undefined,
			courses,
		}, {
			headers: {
				'Set-Cookie': await commitUserSession(userSession), // eslint-disable-line @typescript-eslint/naming-convention
			},
		});
	} catch (error) {
		logger.logDebug(`Error getting courses: ${(error as Error).message}`);
		return json({
			courses: [],
			error: 'Erro ao carregar cursos',
		});
	}
};

export const action = async ({request}: ActionFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));

	try {
		if ((userSession.get('roles') as string[])?.includes('admin')) {
			const formData = await request.formData();

			const newCourse = {
				name: formData.get('name') as string,
				description: formData.get('description') as string,
				content: formData.get('content') as string,
				videoSourceUrl: formData.get('videoSourceUrl') as string,
				thumbnailUrl: formData.get('thumbnailUrl') as string,
				publicationDate: new Date(formData.get('publicationDate') as string),
				published: Boolean(formData.get('published')),
				isSelling: Boolean(formData.get('isSelling')),
			};

			await new CourseService().create(newCourse);

			userSession.flash('success', `Curso ${newCourse.name} criado com sucesso`);

			return redirect('/admin/courses', {
				headers: {
					'Set-Cookie': await commitUserSession(userSession), // eslint-disable-line @typescript-eslint/naming-convention
				},
			});
		}

		userSession.flash('error', 'Você não tem permissão para criar cursos');
		return redirect('/admin/courses', {
			headers: {
				'Set-Cookie': await commitUserSession(userSession), // eslint-disable-line @typescript-eslint/naming-convention
			},
		});
	} catch (error) {
		logger.logError(`Error creating course: ${(error as Error).message}`);
		userSession.flash('error', 'Erro ao criar curso');
		return redirect('/admin/courses', {
			headers: {
				'Set-Cookie': await commitUserSession(userSession), // eslint-disable-line @typescript-eslint/naming-convention
			},
		});
	}
};

export default function Courses() {
	const {
		courses,
		error,
		success,
	} = useLoaderData<CoursesLoaderData>();
	const [quill, setQuill] = useState<Quill | null>(null); // eslint-disable-line @typescript-eslint/ban-types
	const [content, setContent] = useState<string>('');
	const [open, setOpen] = useState<boolean>(false);
	const navigation = useNavigation();
	const isSubmitting = navigation.formAction === '/admin/courses';

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

	return (
		<>
			{(success ?? error) && (
				<p className='mb-4 text-lg'>
					{success ?? error}
				</p>
			)}
			<Dialog.Root open={open} onOpenChange={setOpen}>
				<div className='flex items-center gap-5'>
					<h1>Cursos</h1>
					<Dialog.Trigger asChild>
						<div className='w-fit'>
							<Button
								preset={ButtonPreset.Primary}
								text='Adicionar Novo Curso'
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
									Adicionar Novo Curso
								</h1>
							</Dialog.Title>
							<div>
								<RadixForm.Root asChild>
									<Form method='post' action='/admin/courses' className='flex flex-col gap-3'>

										<RadixForm.Field name='name'>
											<div className='flex items-baseline justify-between'>
												<RadixForm.Label>
													<p>Nome</p>
												</RadixForm.Label>
											</div>
											<RadixForm.Control asChild>
												<input
													required
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
											<Button key='Criar Curso' isDisabled={isSubmitting} className='m-auto mt-2' text='Criar Curso' preset={ButtonPreset.Primary} type={ButtonType.Submit}/>
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
			<div className='flex gap-4 my-4 flex-wrap'>
				{courses?.map(course => (
					<CourseCard key={course?.id} course={course ?? {}} to={`./${course?.id}`}/>
				))}
			</div>
		</>
	);
}
