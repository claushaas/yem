/* eslint-disable @typescript-eslint/naming-convention */
import {
	Form, useLoaderData, useNavigation, useParams, type ActionFunctionArgs, type LoaderFunctionArgs, data,
} from 'react-router';
import {useEffect, useState} from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as RadixForm from '@radix-ui/react-form';
import * as Switch from '@radix-ui/react-switch';
import {XMarkIcon} from '@heroicons/react/24/outline';
import {logger} from '~/utils/logger.util';
import {commitUserSession, getUserSession} from '~/utils/session.server';
import {ModuleService} from '~/services/module.service.server';
import {LessonService} from '~/services/lesson.service.server';
import {type TUser} from '~/types/user.type';
import {Button, ButtonPreset, ButtonType} from '~/components/button.js';
import {YemSpinner} from '~/components/yem-spinner.js';

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

		return data({
			module,
			success: userSession.get('success') as string | undefined,
			meta,
		}, {
			headers: {
				'Set-Cookie': await commitUserSession(userSession),
			},
		});
	} catch (error) {
		logger.logError(`Error getting module: ${(error as Error).message}`);
		return data({
			module: undefined,
			success: undefined,
			meta,
		}, {
			headers: {
				'Set-Cookie': await commitUserSession(userSession),
			},
		});
	}
};

export const action = async ({request}: ActionFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));

	try {
		if ((userSession.get('roles') as string[])?.includes('admin')) {
			const formData = await request.formData();

			if (formData.get('formType') === 'existingLesson') {
				const lessonSlug = formData.get('lessonSlug') as string;
				const moduleSlug = formData.get('moduleSlug') as string;
				const publicationDate = new Date(formData.get('publicationDate') as string);
				const isPublished = Boolean(formData.get('isPublished'));
				const order = Number(formData.get('order'));

				await new LessonService().associateLessonWithModule(lessonSlug, moduleSlug, publicationDate, isPublished, order);

				userSession.flash('success', 'Aula associada com sucesso');
			} else {
				userSession.flash('error', 'Formulário inválido');
			}
		} else {
			userSession.flash('error', 'Você não tem permissão');
		}
	} catch (error) {
		logger.logError(`Error: ${(error as Error).message}`);
		userSession.flash('error', (error as Error).message);
	}

	return data({}, {headers: {'Set-Cookie': await commitUserSession(userSession)}});
};

export default function AddExistingLessonForm() {
	const {
		module,
		success,
	} = useLoaderData<typeof loader>();

	const {
		'course-slug': courseSlug,
		'module-slug': moduleSlug,
	} = useParams();

	const [existingLessonDialogIsOpen, setExistingLessonDialogIsOpen] = useState(false);

	const navigation = useNavigation();
	const isSubmittingAnyForm = navigation.formAction === `/admin/courses/${courseSlug}/${moduleSlug}`;

	const defaultDate = new Date(module?.publicationDate ?? new Date());
	defaultDate.setHours(defaultDate.getHours() - 3);

	useEffect(() => {
		if (success) {
			setExistingLessonDialogIsOpen(false);
		}
	}, [success]);

	return module && (
		<Dialog.Root open={existingLessonDialogIsOpen} onOpenChange={setExistingLessonDialogIsOpen}>
			<Dialog.Trigger asChild>
				<div className='w-fit'>
					<Button
						preset={ButtonPreset.Primary}
						text='Adicionar Aula Existente'
						type={ButtonType.Button}
					/>
				</div>
			</Dialog.Trigger>

			<Dialog.Portal>
				<Dialog.Overlay className='bg-mauvea-12 fixed inset-0'/>

				<Dialog.Content className='fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] p-4 max-w-screen-lg w-[90%] bg-mauve-2 dark:bg-mauvedark-2 rounded-xl overflow-y-auto max-h-[90%]'>
					<Dialog.Title asChild>
						<h1 className='mb-4'>
							Adicionar Aula Existente
						</h1>
					</Dialog.Title>

					<RadixForm.Root asChild>
						<Form method='post' action={`/admin/courses/${courseSlug}/${moduleSlug}`} className='flex flex-col gap-3'>
							<RadixForm.Field name='lessonSlug'>
								<div className='flex items-baseline justify-between'>
									<RadixForm.Label>
										<p>Slug da Aula Existente</p>
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

							<RadixForm.Field name='moduleSlug'>
								<RadixForm.Control asChild>
									<input
										disabled={isSubmittingAnyForm}
										type='text'
										className='hidden'
										value={module.module.slug}
									/>
								</RadixForm.Control>
							</RadixForm.Field>

							<RadixForm.Field name='formType' className='hidden'>
								<RadixForm.Control asChild>
									<input
										disabled={isSubmittingAnyForm}
										type='text'
										value='existingLesson'
									/>
								</RadixForm.Control>
							</RadixForm.Field>

							<RadixForm.Submit asChild>
								<Button isDisabled={isSubmittingAnyForm} className='m-auto mt-2' text='Adicionar Aula Existente' preset={ButtonPreset.Primary} type={ButtonType.Submit}/>
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
	);
}
