import { XMarkIcon } from '@heroicons/react/24/outline';
import * as Dialog from '@radix-ui/react-dialog';
import * as RadixForm from '@radix-ui/react-form';
import * as Switch from '@radix-ui/react-switch';
import { useEffect, useState } from 'react';
import { Form, useLoaderData, useNavigation } from 'react-router';
import Select from 'react-select';
import { Button, ButtonPreset, ButtonType } from '~/components/button.js';
import { Editor } from '~/components/text-editor.client.js';
import { YemSpinner } from '~/components/yem-spinner.js';
import { type loader } from '~/routes/admin.courses_.js';
import { useTextEditor } from '../hooks/use-text-editor.hook.js';

export function CourseCreateOrEditForm() {
	const { courses, success } = useLoaderData<typeof loader>();
	const [content, setContetQuill] = useTextEditor();
	const [mktContent, setMktQuill] = useTextEditor();
	const [open, setOpen] = useState<boolean>(false);
	const [coursesSlug, setCoursesSlug] = useState<
		Array<{ value: string; label: string }>
	>([]);
	const navigation = useNavigation();
	const isSubmitting = navigation.formAction === '/admin/courses';

	useEffect(() => {
		if (success) {
			setOpen(false);
		}
	}, [success]);

	return (
		<Dialog.Root onOpenChange={setOpen} open={open}>
			<Dialog.Trigger asChild>
				<div>
					<Button
						preset={ButtonPreset.Primary}
						text="Adicionar Novo Curso"
						type={ButtonType.Button}
					/>
				</div>
			</Dialog.Trigger>

			<Dialog.Portal>
				<Dialog.Overlay className="bg-mauvea-12 fixed inset-0" />

				<Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] p-4 max-w-(--breakpoint-lg) w-[90%] bg-mauve-2 dark:bg-mauvedark-2 rounded-xl overflow-y-auto max-h-[90%]">
					<Dialog.Title asChild>
						<h1 className="mb-4">Adicionar Novo Curso</h1>
					</Dialog.Title>

					<RadixForm.Root asChild>
						<Form
							action="/admin/courses"
							className="flex flex-col gap-3"
							method="post"
						>
							<RadixForm.Field name="oldId">
								<div className="flex items-baseline justify-between">
									<RadixForm.Label>
										<p>ID da Plataforma Antiga</p>
									</RadixForm.Label>
								</div>
								<RadixForm.Control asChild>
									<input
										className="w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-hidden"
										disabled={isSubmitting}
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
										disabled={isSubmitting}
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
										disabled={isSubmitting}
										min={8}
										required
										type="text"
									/>
								</RadixForm.Control>
							</RadixForm.Field>

							<RadixForm.Field name="order">
								<div className="flex items-baseline justify-between">
									<RadixForm.Label>
										<p>Posição do curso</p>
									</RadixForm.Label>
								</div>
								<RadixForm.Control asChild>
									<input
										className="w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-hidden"
										disabled={isSubmitting}
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
										disabled={isSubmitting}
										min={8}
										type="text"
										value={content}
									/>
								</RadixForm.Control>
							</RadixForm.Field>

							<Editor
								placeholder="Adicione aqui o conteúdo do curso, que só aparece para os alunos..."
								setQuill={setContetQuill}
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
										disabled={isSubmitting}
										min={8}
										type="text"
										value={mktContent}
									/>
								</RadixForm.Control>
							</RadixForm.Field>

							<Editor
								placeholder="Adicione aqui o conteúdo de divulgação do curso, que aparece para quem não é aluno..."
								setQuill={setMktQuill}
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
										disabled={isSubmitting}
										min={3}
										type="text"
									/>
								</RadixForm.Control>
							</RadixForm.Field>

							<RadixForm.Field name="marketingVideoUrl">
								<div className="flex items-baseline justify-between">
									<RadixForm.Label>
										<p>Vídeo para Divulgação</p>
									</RadixForm.Label>
								</div>
								<RadixForm.Control asChild>
									<input
										className="w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-hidden"
										disabled={isSubmitting}
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
										disabled={isSubmitting}
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
										defaultValue={new Date().toISOString().slice(0, 16)}
										disabled={isSubmitting}
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
										disabled={isSubmitting}
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
										disabled={isSubmitting}
									>
										<Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full shadow-[0_2px_2px] shadow-blackA4 transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px]" />
									</Switch.Root>
								</RadixForm.Control>
							</RadixForm.Field>

							<RadixForm.Field name="delegateAuthTo">
								<div className="flex items-baseline justify-between">
									<RadixForm.Label>
										<p>Delegar Autorização Para</p>
									</RadixForm.Label>
								</div>
								<RadixForm.Control asChild>
									<input
										className="hidden"
										disabled={isSubmitting}
										type="text"
										value={coursesSlug.map((course) => course.value).join(',')}
									/>
								</RadixForm.Control>
								<Select
									defaultValue={coursesSlug}
									isMulti
									onChange={(selectedOption) => {
										setCoursesSlug(
											selectedOption as Array<{ value: string; label: string }>,
										);
									}}
									options={courses?.data.map((course) => ({
										label: course.name,
										value: course.slug,
									}))}
								/>
							</RadixForm.Field>

							<RadixForm.Submit asChild>
								<Button
									className="m-auto mt-2"
									isDisabled={isSubmitting}
									key="Criar Curso"
									preset={ButtonPreset.Primary}
									text="Criar Curso"
									type={ButtonType.Submit}
								/>
							</RadixForm.Submit>

							{isSubmitting && <YemSpinner />}
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
	);
}
