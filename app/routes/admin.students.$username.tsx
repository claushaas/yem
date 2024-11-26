/* eslint-disable @typescript-eslint/naming-convention */
import {
	Form, type MetaArgs, useLoaderData, useNavigation, useParams, type ActionFunctionArgs, type LoaderFunctionArgs, data,
} from 'react-router';
import * as Dialog from '@radix-ui/react-dialog';
import * as RadixForm from '@radix-ui/react-form';
import {useEffect, useState} from 'react';
import {XMarkIcon} from '@heroicons/react/24/outline';
import {Button, ButtonPreset, ButtonType} from '~/components/button.js';
import {UserService} from '~/services/user.service.server';
import {commitUserSession, getUserSession} from '~/utils/session.server';
import {YemSpinner} from '~/components/yem-spinner.js';
import {logger} from '~/utils/logger.util';
import SubscriptionService from '~/services/subscription.service.server';
import {SuccessOrErrorMessage} from '~/components/admin-success-or-error-message.js';

export const meta = ({data}: MetaArgs<typeof loader>) => ([
	{title: `${data!.studentData?.firstName} ${data!.studentData?.lastName} - Yoga em Movimento`},
	{name: 'description', content: 'Página de aluno do Yoga em Movimento'},
	{name: 'robots', content: 'noindex, nofollow'},
	...data!.meta,
]);

export const loader = async ({request, params}: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));
	const {username} = params;

	const meta = [
		{tagName: 'link', rel: 'canonical', href: new URL(`/admin/students/${username}`, request.url).toString()},
	];

	try {
		const {data: studentData} = await new UserService().getUserData(username!);
		const {data: subscriptions} = await new SubscriptionService().getUserSubscriptions(studentData);

		return data(
			{
				studentData,
				subscriptions,
				error: userSession.get('error') as string | undefined,
				success: userSession.get('success') as string | undefined,
				meta,
			},
			{
				headers: {
					'Set-Cookie': await commitUserSession(userSession),
				},
			},
		);
	} catch {
		userSession.flash('error', `Erro ao buscar dados do aluno ${username}`);

		return data(
			{
				studentData: undefined,
				subscriptions: undefined,
				error: userSession.get('error') as string | undefined,
				success: userSession.get('success') as string | undefined,
				meta,
			},
			{
				headers: {
					'Set-Cookie': await commitUserSession(userSession),
				},
			},
		);
	}
};

export const action = async ({request, params}: ActionFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));
	const {username} = params;
	const formData = await request.formData();
	const formType = formData.get('type') as string;
	const userService = new UserService();

	try {
		switch (formType) {
			case 'name': {
				const id = formData.get('id') as string;
				const email = formData.get('email') as string;
				const firstName = formData.get('firstName') as string;
				const lastName = formData.get('lastName') as string;

				await userService.updateUserName(id, email, firstName, lastName);

				userSession.flash('success', `Nome do aluno atualizado com sucesso para ${firstName} ${lastName}`);

				break;
			}

			case 'email': {
				const id = formData.get('id') as string;
				const oldEmail = formData.get('oldEmail') as string;
				const newEmail = formData.get('newEmail') as string;

				await userService.updateUserEmail(id, oldEmail, newEmail);

				userSession.flash('success', `Email do aluno atualizado com sucesso para ${newEmail}`);

				break;
			}

			case 'phoneNumber': {
				const id = formData.get('id') as string;
				const phoneNumber = formData.get('phoneNumber') as string;

				await userService.updateUserPhoneNumber(id, phoneNumber);

				userSession.flash('success', `Telefone do aluno atualizado com sucesso para ${phoneNumber}`);

				break;
			}

			case 'document': {
				const id = formData.get('id') as string;
				const document = formData.get('document') as string;

				await userService.updateUserDocument(id, document);

				userSession.flash('success', `Documento do aluno atualizado com sucesso para ${document}`);

				break;
			}

			case 'subscriptions': {
				const {data: user} = await userService.getUserData(username!);

				await new SubscriptionService().resetUserSubscriptions(user);

				userSession.flash('success', 'Matrículas do aluno resetadas com sucesso');

				break;
			}

			default: {
				userSession.flash('error', 'Tipo de formulário inválido');
				break;
			}
		}
	} catch (error) {
		logger.logError(`Erro ao editar ${formType} do aluno ${username}: ${(error as Error).message}`);
		userSession.flash('error', (error as Error).message);
	}

	return data({}, {headers: {'Set-Cookie': await commitUserSession(userSession)}});
};

export default function Student() {
	const {
		error,
		success,
		studentData,
		subscriptions,
	} = useLoaderData<typeof loader>();

	const [nameDialogIsOpen, setNameDialogIsOpen] = useState(false);
	const [emailDialogIsOpen, setEmailDialogIsOpen] = useState(false);
	const [phoneNumberDialogIsOpen, setPhoneNumberDialogIsOpen] = useState(false);
	const [documentDialogIsOpen, setDocumentDialogIsOpen] = useState(false);

	const {username} = useParams();

	const navigation = useNavigation();
	const isSubmittingAnyForm = navigation.formAction === `/admin/students/${username}`;

	useEffect(() => {
		if (success ?? error) {
			setNameDialogIsOpen(false);
			setEmailDialogIsOpen(false);
			setPhoneNumberDialogIsOpen(false);
			setDocumentDialogIsOpen(false);
		}
	}, [success, error]);

	return studentData && (
		<>
			<SuccessOrErrorMessage success={success} error={error}/>

			<div>
				<h1>{`${studentData.firstName} ${studentData.lastName}`}</h1>
				<Dialog.Root open={nameDialogIsOpen} onOpenChange={setNameDialogIsOpen}>
					<Dialog.Trigger asChild>
						<div>
							<Button text='Editar Nome' type={ButtonType.Button} preset={ButtonPreset.Secondary}/>
						</div>
					</Dialog.Trigger>

					<Dialog.Portal>
						<Dialog.Overlay className='bg-mauvea-12 fixed inset-0'/>

						<Dialog.Content className='fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] p-4 max-w-screen-lg w-[90%] bg-mauve-2 dark:bg-mauvedark-2 rounded-xl overflow-y-auto max-h-[90%]'>
							<Dialog.Title asChild>
								<h1 className='mb-4'>
									Editar o Nome do Aluno
								</h1>
							</Dialog.Title>

							<RadixForm.Root asChild>
								<Form method='post' action={`/admin/students/${username}`} className='flex flex-col gap-3'>
									<RadixForm.Field name='firstName'>
										<div className='flex items-baseline justify-between'>
											<RadixForm.Label>
												<p>Primeiro Nome</p>
											</RadixForm.Label>
										</div>
										<RadixForm.Control asChild>
											<input
												required
												defaultValue={studentData.firstName}
												disabled={isSubmittingAnyForm}
												type='text'
												min={3}
												className='w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-none'
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<RadixForm.Field name='lastName'>
										<div className='flex items-baseline justify-between'>
											<RadixForm.Label>
												<p>Sobrenome</p>
											</RadixForm.Label>
										</div>
										<RadixForm.Control asChild>
											<input
												required
												defaultValue={studentData.lastName}
												disabled={isSubmittingAnyForm}
												type='text'
												min={3}
												className='w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-none'
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<RadixForm.Field name='id' className='hidden'>
										<RadixForm.Control asChild>
											<input
												disabled={isSubmittingAnyForm}
												type='text'
												value={studentData.id}
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<RadixForm.Field name='email' className='hidden'>
										<RadixForm.Control asChild>
											<input
												disabled={isSubmittingAnyForm}
												type='text'
												value={studentData.email}
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<RadixForm.Field name='type' className='hidden'>
										<RadixForm.Control asChild>
											<input
												disabled={isSubmittingAnyForm}
												type='text'
												value='name'
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<RadixForm.Submit asChild>
										<Button isDisabled={isSubmittingAnyForm} className='m-auto mt-2' text='Enviar' preset={ButtonPreset.Primary} type={ButtonType.Submit}/>
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
			</div>

			<div>
				<h3>{studentData.id}</h3>
			</div>

			<div>
				<h3>{studentData.email}</h3>
				<Dialog.Root open={emailDialogIsOpen} onOpenChange={setEmailDialogIsOpen}>
					<Dialog.Trigger asChild>
						<div>
							<Button text='Editar Email' type={ButtonType.Button} preset={ButtonPreset.Secondary}/>
						</div>
					</Dialog.Trigger>

					<Dialog.Portal>
						<Dialog.Overlay className='bg-mauvea-12 fixed inset-0'/>

						<Dialog.Content className='fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] p-4 max-w-screen-lg w-[90%] bg-mauve-2 dark:bg-mauvedark-2 rounded-xl overflow-y-auto max-h-[90%]'>
							<Dialog.Title asChild>
								<h1 className='mb-4'>
									Editar o Email do Aluno
								</h1>
							</Dialog.Title>

							<RadixForm.Root asChild>
								<Form method='post' action={`/admin/students/${username}`} className='flex flex-col gap-3'>
									<RadixForm.Field name='newEmail'>
										<div className='flex items-baseline justify-between'>
											<RadixForm.Label>
												<p>Email</p>
											</RadixForm.Label>
										</div>
										<RadixForm.Control asChild>
											<input
												required
												defaultValue={studentData.email}
												disabled={isSubmittingAnyForm}
												type='email'
												min={3}
												className='w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-none'
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<RadixForm.Field name='id' className='hidden'>
										<RadixForm.Control asChild>
											<input
												disabled={isSubmittingAnyForm}
												type='text'
												value={studentData.id}
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<RadixForm.Field name='oldEmail' className='hidden'>
										<RadixForm.Control asChild>
											<input
												disabled={isSubmittingAnyForm}
												type='email'
												value={studentData.email}
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<RadixForm.Field name='type' className='hidden'>
										<RadixForm.Control asChild>
											<input
												disabled={isSubmittingAnyForm}
												type='text'
												value='email'
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<RadixForm.Submit asChild>
										<Button isDisabled={isSubmittingAnyForm} className='m-auto mt-2' text='Enviar' preset={ButtonPreset.Primary} type={ButtonType.Submit}/>
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
			</div>

			<div>
				<h3>{studentData.phoneNumber}</h3>
				<Dialog.Root open={phoneNumberDialogIsOpen} onOpenChange={setPhoneNumberDialogIsOpen}>
					<Dialog.Trigger asChild>
						<div>
							<Button text='Editar Telefone' type={ButtonType.Button} preset={ButtonPreset.Secondary}/>
						</div>
					</Dialog.Trigger>

					<Dialog.Portal>
						<Dialog.Overlay className='bg-mauvea-12 fixed inset-0'/>

						<Dialog.Content className='fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] p-4 max-w-screen-lg w-[90%] bg-mauve-2 dark:bg-mauvedark-2 rounded-xl overflow-y-auto max-h-[90%]'>
							<Dialog.Title asChild>
								<h1 className='mb-4'>
									Editar o Telefone do Aluno
								</h1>
							</Dialog.Title>

							<RadixForm.Root asChild>
								<Form method='post' action={`/admin/students/${username}`} className='flex flex-col gap-3'>
									<RadixForm.Field name='phoneNumber'>
										<div className='flex items-baseline justify-between'>
											<RadixForm.Label>
												<p>Telefone</p>
											</RadixForm.Label>
										</div>
										<RadixForm.Control asChild>
											<input
												required
												defaultValue={studentData.phoneNumber}
												disabled={isSubmittingAnyForm}
												type='text'
												min={3}
												className='w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-none'
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<RadixForm.Field name='id' className='hidden'>
										<RadixForm.Control asChild>
											<input
												disabled={isSubmittingAnyForm}
												type='text'
												value={studentData.id}
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<RadixForm.Field name='type' className='hidden'>
										<RadixForm.Control asChild>
											<input
												disabled={isSubmittingAnyForm}
												type='text'
												value='phoneNumber'
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<RadixForm.Submit asChild>
										<Button isDisabled={isSubmittingAnyForm} className='m-auto mt-2' text='Enviar' preset={ButtonPreset.Primary} type={ButtonType.Submit}/>
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
			</div>

			<div>
				{ }
				<h3>{studentData.document && studentData.document.length > 3 ? studentData.document : 'Pedir para cadastrar CPF'}</h3>
				<Dialog.Root open={documentDialogIsOpen} onOpenChange={setDocumentDialogIsOpen}>
					<Dialog.Trigger asChild>
						<div>
							<Button text='Editar Documento' type={ButtonType.Button} preset={ButtonPreset.Secondary}/>
						</div>
					</Dialog.Trigger>

					<Dialog.Portal>
						<Dialog.Overlay className='bg-mauvea-12 fixed inset-0'/>

						<Dialog.Content className='fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] p-4 max-w-screen-lg w-[90%] bg-mauve-2 dark:bg-mauvedark-2 rounded-xl overflow-y-auto max-h-[90%]'>
							<Dialog.Title asChild>
								<h1 className='mb-4'>
									Editar o Documento do Aluno
								</h1>
							</Dialog.Title>

							<RadixForm.Root asChild>
								<Form method='post' action={`/admin/students/${username}`} className='flex flex-col gap-3'>
									<RadixForm.Field name='document'>
										<div className='flex items-baseline justify-between'>
											<RadixForm.Label>
												<p>Documento (CPF)</p>
											</RadixForm.Label>
										</div>
										<RadixForm.Control asChild>
											<input
												required
												defaultValue={studentData.document}
												disabled={isSubmittingAnyForm}
												type='text'
												min={3}
												className='w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-none'
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<RadixForm.Field name='id' className='hidden'>
										<RadixForm.Control asChild>
											<input
												disabled={isSubmittingAnyForm}
												type='text'
												value={studentData.id}
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<RadixForm.Field name='type' className='hidden'>
										<RadixForm.Control asChild>
											<input
												disabled={isSubmittingAnyForm}
												type='text'
												value='document'
											/>
										</RadixForm.Control>
									</RadixForm.Field>

									<RadixForm.Submit asChild>
										<Button isDisabled={isSubmittingAnyForm} className='m-auto mt-2' text='Enviar' preset={ButtonPreset.Primary} type={ButtonType.Submit}/>
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
			</div>

			<div>
				<h2>Matrículas</h2>

				<RadixForm.Root asChild>
					<Form method='post' action={`/admin/students/${username}`}>

						<RadixForm.Field name='id' className='hidden'>
							<RadixForm.Control asChild>
								<input
									disabled={isSubmittingAnyForm}
									type='text'
									value={studentData.id}
								/>
							</RadixForm.Control>
						</RadixForm.Field>

						<RadixForm.Field name='type' className='hidden'>
							<RadixForm.Control asChild>
								<input
									disabled={isSubmittingAnyForm}
									type='text'
									value='subscriptions'
								/>
							</RadixForm.Control>
						</RadixForm.Field>

						<RadixForm.Submit asChild>
							<Button isDisabled={isSubmittingAnyForm} text='Resetar Matrículas' preset={ButtonPreset.Secondary} type={ButtonType.Submit}/>
						</RadixForm.Submit>

						{isSubmittingAnyForm && <YemSpinner/>}
					</Form>
				</RadixForm.Root>

				{subscriptions && (
					<ul>
						{subscriptions.map(subscription => (
							<li key={subscription.id}>
								<h3>{subscription.course.name} - {subscription.provider} - {subscription.providerSubscriptionId}</h3>
								<p>{subscription.expiresAt.toLocaleDateString()}</p>
							</li>
						))}
					</ul>
				)}
			</div>
		</>
	);
}
