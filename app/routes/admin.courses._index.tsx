import {XMarkIcon} from '@heroicons/react/24/outline';
import * as Dialog from '@radix-ui/react-dialog';
import {type ActionFunctionArgs, json, type LoaderFunctionArgs} from '@remix-run/node';
import {Form, useLoaderData, useNavigation} from '@remix-run/react';
import * as RadixForm from '@radix-ui/react-form';
import type Quill from 'quill';
import {useEffect, useState} from 'react';
import {ClientOnly} from 'remix-utils/client-only';
import {CourseService} from '#/services/course.service';
import {Button, ButtonPreset, ButtonType} from '~/components/button/index.js';
import {getUserSession} from '~/utils/session.server.js';
import {logger} from '#/utils/logger.util.js';
import {CourseCard} from '~/components/course-card/index.js';
import {Editor} from '~/components/text-editor/index.client.js';
import {YemSpinner} from '~/components/yem-spinner/index.js';

export const loader = async ({request}: LoaderFunctionArgs) => {
	const {data: userData} = await getUserSession(request.headers.get('Cookie'));

	try {
		const response = await new CourseService().getAll(userData.roles as string[] ?? []);
		return json({
			courses: response.data,
		});
	} catch (error) {
		logger.logDebug(`Error getting courses: ${(error as Error).message}`);
		return json({courses: []});
	}
};

export const action = async ({request}: ActionFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));

	if ((userSession.get('roles') as string[])?.includes('admin')) {
		const formData = await request.formData();
		const name = formData.get('name');
		const description = formData.get('description');
		const content = formData.get('content');
		const videoSourceUrl = formData.get('videoSourceUrl');
		const thumbnailUrl = formData.get('thumbnailUrl');
		const publicationDate = formData.get('publicationDate');
		const published = formData.get('published');
		const isSelling = formData.get('isSelling');

		console.log('name', name);
		console.log('description', description);
		console.log('content', content);
		console.log('videoSourceUrl', videoSourceUrl);
		console.log('thumbnailUrl', thumbnailUrl);
		console.log('publicationDate', publicationDate);
		console.log('published', published);
		console.log('isSelling', isSelling);
	}

	return null;
};

export default function Courses() {
	const {courses} = useLoaderData<typeof loader>();
	const [quill, setQuill] = useState<Quill | null>(null); // eslint-disable-line @typescript-eslint/ban-types
	const [content, setContent] = useState<string>('');
	const navigation = useNavigation();
	const isSubmitting = navigation.formAction === '/admin/courses';

	useEffect(() => {
		if (quill) {
			quill.on('text-change', () => {
				setContent(JSON.stringify(quill.getContents()));
			});
		}
	}, [quill]);

	return (
		<>
			<Dialog.Root>
				<Dialog.Trigger asChild>
					<div className='w-fit'>
						<Button
							preset={ButtonPreset.Primary}
							text='Adicionar Novo Curso'
							type={ButtonType.Button}
						/>
					</div>
				</Dialog.Trigger>

				<Dialog.Portal>
					<Dialog.Overlay className='bg-mauvea-12 fixed inset-0'/>

					<Dialog.Content className='fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] p-4 max-w-[90%] w-full bg-mauve-2 dark:bg-mauvedark-2 rounded-xl flex flex-col justify-center gap-8'>
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
													type='text'
													min={8}
													className='hidden'
													value={content}
												/>
											</RadixForm.Control>
										</RadixForm.Field>

										<ClientOnly fallback={<YemSpinner/>}>
											{() => <Editor setQuill={setQuill}/>}
										</ClientOnly>

										<RadixForm.Field name='videoSourceUrl'>
											<div className='flex items-baseline justify-between'>
												<RadixForm.Label>
													<p>Vídeo</p>
												</RadixForm.Label>
											</div>
											<RadixForm.Control asChild>
												<input
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
												<input
													type='text'
													min={3}
													className='w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-none'
												/>
											</RadixForm.Control>
										</RadixForm.Field>

										<RadixForm.Field name='isSelling'>
											<div className='flex items-baseline justify-between'>
												<RadixForm.Label>
													<p>Está com matrículas abertas</p>
												</RadixForm.Label>
											</div>
											<RadixForm.Control asChild>
												<input
													type='text'
													min={3}
													className='w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-none'
												/>
											</RadixForm.Control>
										</RadixForm.Field>

										<RadixForm.Submit asChild>
											<Button isDisabled={isSubmitting} className='m-auto mt-2' text='Criar Minha Conta' preset={ButtonPreset.Primary} type={ButtonType.Submit}/>
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
					<CourseCard key={course.id} course={course} to={`./${course.id}`}/>
				))}
			</div>
		</>
	);
}
