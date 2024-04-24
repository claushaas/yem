import {XMarkIcon} from '@heroicons/react/24/outline';
import * as Dialog from '@radix-ui/react-dialog';
import {
	Form, useLoaderData, useNavigation,
} from '@remix-run/react';
import * as RadixForm from '@radix-ui/react-form';
import type Quill from 'quill';
import {useEffect, useState} from 'react';
import {ClientOnly} from 'remix-utils/client-only';
import * as Switch from '@radix-ui/react-switch';
import Select from 'react-select';
import {Button, ButtonPreset, ButtonType} from '~/components/button.js';
import {Editor} from '~/components/text-editor.client.js';
import {YemSpinner} from '~/components/yem-spinner.js';
import {type TCoursesLoaderData} from '~/routes/admin.courses_';

export function CourseCreateOrEditForm() {
	const {
		courses,
		success,
	} = useLoaderData<TCoursesLoaderData>();
	const [quill, setQuill] = useState<Quill | null>(null); // eslint-disable-line @typescript-eslint/ban-types
	const [content, setContent] = useState<string>('');
	const [mktQuill, setMktQuill] = useState<Quill | null>(null); // eslint-disable-line @typescript-eslint/ban-types
	const [mktContent, setMktContent] = useState<string>('');
	const [open, setOpen] = useState<boolean>(false);
	const [coursesSlug, setCoursesSlug] = useState<Array<{value: string; label: string}>>([]);
	const navigation = useNavigation();
	const isSubmitting = navigation.formAction === '/admin/courses';

	useEffect(() => {
		if (success) {
			setOpen(false);
		}
	}, [success]);

	useEffect(() => {
		if (mktQuill) {
			mktQuill.on('text-change', () => {
				setMktContent(JSON.stringify(mktQuill.getContents()));
			});
		}
	}, [mktQuill]);

	useEffect(() => {
		if (quill) {
			quill.on('text-change', () => {
				setContent(JSON.stringify(quill.getContents()));
			});
		}
	}, [quill]);

	return (
		<Dialog.Root open={open} onOpenChange={setOpen}>
			<Dialog.Trigger asChild>
				<div><Button preset={ButtonPreset.Primary} text='Adicionar Novo Curso' type={ButtonType.Button}/></div>
			</Dialog.Trigger>

			<Dialog.Portal>
				<Dialog.Overlay className='bg-mauvea-12 fixed inset-0'/>

				<Dialog.Content className='fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] p-4 max-w-screen-lg w-[90%] bg-mauve-2 dark:bg-mauvedark-2 rounded-xl overflow-y-auto max-h-[90%]'>
					<Dialog.Title asChild>
						<h1 className='mb-4'>
							Adicionar Novo Curso
						</h1>
					</Dialog.Title>

					<RadixForm.Root asChild>
						<Form method='post' action='/admin/courses' className='flex flex-col gap-3'>

							<RadixForm.Field name='oldId'>
								<div className='flex items-baseline justify-between'>
									<RadixForm.Label>
										<p>ID da Plataforma Antiga</p>
									</RadixForm.Label>
								</div>
								<RadixForm.Control asChild>
									<input
										disabled={isSubmitting}
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

							<RadixForm.Field name='order'>
								<div className='flex items-baseline justify-between'>
									<RadixForm.Label>
										<p>Posição do curso</p>
									</RadixForm.Label>
								</div>
								<RadixForm.Control asChild>
									<input
										disabled={isSubmitting}
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

							<RadixForm.Field name='marketingContent'>
								<div className='flex items-baseline justify-between'>
									<RadixForm.Label>
										<p>Conteúdo para Divulgação</p>
									</RadixForm.Label>
								</div>
								<RadixForm.Control asChild>
									<input
										disabled={isSubmitting}
										type='text'
										min={8}
										className='hidden'
										value={mktContent}
									/>
								</RadixForm.Control>
							</RadixForm.Field>

							<ClientOnly fallback={<YemSpinner/>}>
								{() => <Editor setQuill={setMktQuill} placeholder='Adicione aqui o conteúdo de divulgação do curso, que aparece para quem não é aluno...'/>}
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

							<RadixForm.Field name='marketingVideoUrl'>
								<div className='flex items-baseline justify-between'>
									<RadixForm.Label>
										<p>Vídeo para Divulgação</p>
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
										defaultValue={new Date().toISOString().slice(0, 16)}
										disabled={isSubmitting}
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

							<RadixForm.Field name='delegateAuthTo'>
								<div className='flex items-baseline justify-between'>
									<RadixForm.Label>
										<p>Delegar Autorização Para</p>
									</RadixForm.Label>
								</div>
								<RadixForm.Control asChild>
									<input
										disabled={isSubmitting}
										type='text'
										className='hidden'
										value={coursesSlug.map(course => course.value).join(',')}
									/>
								</RadixForm.Control>
								<Select
									isMulti
									defaultValue={coursesSlug}
									options={courses?.data.map(course => ({value: course.slug, label: course.name}))}
									onChange={selectedOption => {
										setCoursesSlug(selectedOption as Array<{value: string; label: string}>);
									}}
								/>
							</RadixForm.Field>

							<RadixForm.Submit asChild>
								<Button key='Criar Curso' isDisabled={isSubmitting} className='m-auto mt-2' text='Criar Curso' preset={ButtonPreset.Primary} type={ButtonType.Submit}/>
							</RadixForm.Submit>

							{isSubmitting && <YemSpinner/>}

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
	);
}
