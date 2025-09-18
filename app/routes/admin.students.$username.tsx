/** biome-ignore-all lint/style/noNonNullAssertion: . */
import { XMarkIcon } from '@heroicons/react/24/outline';
import * as Dialog from '@radix-ui/react-dialog';
import * as RadixForm from '@radix-ui/react-form';
import { useEffect, useState } from 'react';
import {
	type ActionFunctionArgs,
	data,
	Form,
	type LoaderFunctionArgs,
	type MetaArgs,
	useLoaderData,
	useNavigation,
	useParams,
} from 'react-router';
import { SuccessOrErrorMessage } from '~/components/admin-success-or-error-message.js';
import { Button, ButtonPreset, ButtonType } from '~/components/button.js';
import { YemSpinner } from '~/components/yem-spinner.js';
import SubscriptionService from '~/services/subscription.service.server';
import { UserService } from '~/services/user.service.server';
import { logger } from '~/utils/logger.util';
import { commitUserSession, getUserSession } from '~/utils/session.server';

export const meta = ({ data }: MetaArgs<typeof loader>) => [
	{
		title: `${data!.studentData?.firstName} ${data!.studentData?.lastName} - Yoga em Movimento`,
	},
	{ content: 'Página de aluno do Yoga em Movimento', name: 'description' },
	{ content: 'noindex, nofollow', name: 'robots' },
	...data!.meta,
];

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));
	const { username } = params;

	const meta = [
		{
			href: new URL(`/admin/students/${username}`, request.url).toString(),
			rel: 'canonical',
			tagName: 'link',
		},
	];

	try {
		const { data: studentData } = await new UserService().getUserData(
			username!,
		);
		const { data: subscriptions } =
			await new SubscriptionService().getUserSubscriptions(studentData);

		return data(
			{
				error: userSession.get('error') as string | undefined,
				meta,
				studentData,
				subscriptions,
				success: userSession.get('success') as string | undefined,
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
				error: userSession.get('error') as string | undefined,
				meta,
				studentData: undefined,
				subscriptions: undefined,
				success: userSession.get('success') as string | undefined,
			},
			{
				headers: {
					'Set-Cookie': await commitUserSession(userSession),
				},
			},
		);
	}
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));
	const { username } = params;
	const formData = await request.formData();
	const formType = formData.get('type') as string;
	const userService = new UserService();

	try {
		switch (formType) {
			case 'name': {
				const id = formData.get('id') as string;
				const firstName = formData.get('firstName') as string;
				const lastName = formData.get('lastName') as string;

				await userService.updateUserName(id, firstName, lastName);

				userSession.flash(
					'success',
					`Nome do aluno atualizado com sucesso para ${firstName} ${lastName}`,
				);

				break;
			}

			case 'email': {
				const id = formData.get('id') as string;
				const newEmail = formData.get('newEmail') as string;

				await userService.updateUserEmail(id, newEmail);

				userSession.flash(
					'success',
					`Email do aluno atualizado com sucesso para ${newEmail}`,
				);

				break;
			}

			case 'phoneNumber': {
				const id = formData.get('id') as string;
				const phoneNumber = formData.get('phoneNumber') as string;

				await userService.updateUserPhoneNumber(id, phoneNumber);

				userSession.flash(
					'success',
					`Telefone do aluno atualizado com sucesso para ${phoneNumber}`,
				);

				break;
			}

			case 'document': {
				const id = formData.get('id') as string;
				const document = formData.get('document') as string;

				await userService.updateUserDocument(id, document);

				userSession.flash(
					'success',
					`Documento do aluno atualizado com sucesso para ${document}`,
				);

				break;
			}

			case 'subscriptions': {
				const { data: user } = await userService.getUserData(username!);

				await new SubscriptionService().resetUserSubscriptions(user);

				userSession.flash(
					'success',
					'Matrículas do aluno resetadas com sucesso',
				);

				break;
			}

			case 'getNewPassword': {
				await userService.getNewPassword(username!);

				userSession.flash(
					'success',
					'Nova senha enviada para o email do aluno',
				);

				break;
			}

			case 'delete': {
				const id = formData.get('id') as string;

				await userService.deleteUser(id);

				userSession.flash('success', 'Aluno deletado com sucesso');

				break;
			}

			default: {
				userSession.flash('error', 'Tipo de formulário inválido');
				break;
			}
		}
	} catch (error) {
		logger.logError(
			`Erro ao editar ${formType} do aluno ${username}: ${(error as Error).message}`,
		);
		userSession.flash('error', (error as Error).message);
	}

	return data(
		{},
		{ headers: { 'Set-Cookie': await commitUserSession(userSession) } },
	);
};

export default function Student() {
	const { error, success, studentData, subscriptions } =
		useLoaderData<typeof loader>();

	const [nameDialogIsOpen, setNameDialogIsOpen] = useState(false);
	const [emailDialogIsOpen, setEmailDialogIsOpen] = useState(false);
	const [phoneNumberDialogIsOpen, setPhoneNumberDialogIsOpen] = useState(false);
	const [documentDialogIsOpen, setDocumentDialogIsOpen] = useState(false);

	const { username } = useParams();

	const navigation = useNavigation();
	const isSubmittingAnyForm =
		navigation.formAction === `/admin/students/${username}`;

	useEffect(() => {
		if (success ?? error) {
			setNameDialogIsOpen(false);
			setEmailDialogIsOpen(false);
			setPhoneNumberDialogIsOpen(false);
			setDocumentDialogIsOpen(false);
		}
	}, [success, error]);

	return (
		studentData && (
			<>
				<SuccessOrErrorMessage error={error} success={success} />

				<div className="flex gap-4 mb-10">
					<h1>{`${studentData.firstName} ${studentData.lastName}`}</h1>
					<Dialog.Root
						onOpenChange={setNameDialogIsOpen}
						open={nameDialogIsOpen}
					>
						<Dialog.Trigger asChild>
							<div>
								<Button
									preset={ButtonPreset.Secondary}
									text="Editar Nome"
									type={ButtonType.Button}
								/>
							</div>
						</Dialog.Trigger>

						<Dialog.Portal>
							<Dialog.Overlay className="bg-mauvea-12 fixed inset-0" />

							<Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] p-4 max-w-(--breakpoint-lg) w-[90%] bg-mauve-2 dark:bg-mauvedark-2 rounded-xl overflow-y-auto max-h-[90%]">
								<Dialog.Title asChild>
									<h1 className="mb-4">Editar o Nome do Aluno</h1>
								</Dialog.Title>

								<RadixForm.Root asChild>
									<Form
										action={`/admin/students/${username}`}
										className="flex flex-col gap-3"
										method="post"
									>
										<RadixForm.Field name="firstName">
											<div className="flex items-baseline justify-between">
												<RadixForm.Label>
													<p>Primeiro Nome</p>
												</RadixForm.Label>
											</div>
											<RadixForm.Control asChild>
												<input
													className="w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-hidden"
													defaultValue={studentData.firstName}
													disabled={isSubmittingAnyForm}
													min={3}
													required
													type="text"
												/>
											</RadixForm.Control>
										</RadixForm.Field>

										<RadixForm.Field name="lastName">
											<div className="flex items-baseline justify-between">
												<RadixForm.Label>
													<p>Sobrenome</p>
												</RadixForm.Label>
											</div>
											<RadixForm.Control asChild>
												<input
													className="w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-hidden"
													defaultValue={studentData.lastName}
													disabled={isSubmittingAnyForm}
													min={3}
													required
													type="text"
												/>
											</RadixForm.Control>
										</RadixForm.Field>

										<RadixForm.Field className="hidden" name="id">
											<RadixForm.Control asChild>
												<input
													disabled={isSubmittingAnyForm}
													type="text"
													value={studentData.id}
												/>
											</RadixForm.Control>
										</RadixForm.Field>

										<RadixForm.Field className="hidden" name="email">
											<RadixForm.Control asChild>
												<input
													disabled={isSubmittingAnyForm}
													type="text"
													value={studentData.email}
												/>
											</RadixForm.Control>
										</RadixForm.Field>

										<RadixForm.Field className="hidden" name="type">
											<RadixForm.Control asChild>
												<input
													disabled={isSubmittingAnyForm}
													type="text"
													value="name"
												/>
											</RadixForm.Control>
										</RadixForm.Field>

										<RadixForm.Submit asChild>
											<Button
												className="m-auto mt-2"
												isDisabled={isSubmittingAnyForm}
												preset={ButtonPreset.Primary}
												text="Enviar"
												type={ButtonType.Submit}
											/>
										</RadixForm.Submit>

										{isSubmittingAnyForm && <YemSpinner />}
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

					<RadixForm.Root asChild>
						<Form
							action={`/admin/students/${username}`}
							className="flex flex-col gap-3"
							method="post"
						>
							<RadixForm.Field className="hidden" name="type">
								<RadixForm.Control asChild>
									<input
										disabled={isSubmittingAnyForm}
										type="text"
										value="getNewPassword"
									/>
								</RadixForm.Control>
							</RadixForm.Field>

							<RadixForm.Submit asChild>
								<Button
									isDisabled={isSubmittingAnyForm}
									preset={ButtonPreset.Primary}
									text="Enviar Nova Senha"
									type={ButtonType.Submit}
								/>
							</RadixForm.Submit>
						</Form>
					</RadixForm.Root>
				</div>

				<div className="mb-10">
					<h3>ID: {studentData.id}</h3>
				</div>

				<div className="flex gap-4 mb-10">
					<h3>email: {studentData.email}</h3>
					<Dialog.Root
						onOpenChange={setEmailDialogIsOpen}
						open={emailDialogIsOpen}
					>
						<Dialog.Trigger asChild>
							<div>
								<Button
									preset={ButtonPreset.Secondary}
									text="Editar Email"
									type={ButtonType.Button}
								/>
							</div>
						</Dialog.Trigger>

						<Dialog.Portal>
							<Dialog.Overlay className="bg-mauvea-12 fixed inset-0" />

							<Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] p-4 max-w-(--breakpoint-lg) w-[90%] bg-mauve-2 dark:bg-mauvedark-2 rounded-xl overflow-y-auto max-h-[90%]">
								<Dialog.Title asChild>
									<h1 className="mb-4">Editar o Email do Aluno</h1>
								</Dialog.Title>

								<RadixForm.Root asChild>
									<Form
										action={`/admin/students/${username}`}
										className="flex flex-col gap-3"
										method="post"
									>
										<RadixForm.Field name="newEmail">
											<div className="flex items-baseline justify-between">
												<RadixForm.Label>
													<p>Email</p>
												</RadixForm.Label>
											</div>
											<RadixForm.Control asChild>
												<input
													className="w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-hidden"
													defaultValue={studentData.email}
													disabled={isSubmittingAnyForm}
													min={3}
													required
													type="email"
												/>
											</RadixForm.Control>
										</RadixForm.Field>

										<RadixForm.Field className="hidden" name="id">
											<RadixForm.Control asChild>
												<input
													disabled={isSubmittingAnyForm}
													type="text"
													value={studentData.id}
												/>
											</RadixForm.Control>
										</RadixForm.Field>

										<RadixForm.Field className="hidden" name="oldEmail">
											<RadixForm.Control asChild>
												<input
													disabled={isSubmittingAnyForm}
													type="email"
													value={studentData.email}
												/>
											</RadixForm.Control>
										</RadixForm.Field>

										<RadixForm.Field className="hidden" name="type">
											<RadixForm.Control asChild>
												<input
													disabled={isSubmittingAnyForm}
													type="text"
													value="email"
												/>
											</RadixForm.Control>
										</RadixForm.Field>

										<RadixForm.Submit asChild>
											<Button
												className="m-auto mt-2"
												isDisabled={isSubmittingAnyForm}
												preset={ButtonPreset.Primary}
												text="Enviar"
												type={ButtonType.Submit}
											/>
										</RadixForm.Submit>

										{isSubmittingAnyForm && <YemSpinner />}
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
				</div>

				<div className="flex gap-4 mb-10">
					<h3>Telefone: {studentData.phoneNumber}</h3>
					<Dialog.Root
						onOpenChange={setPhoneNumberDialogIsOpen}
						open={phoneNumberDialogIsOpen}
					>
						<Dialog.Trigger asChild>
							<div>
								<Button
									preset={ButtonPreset.Secondary}
									text="Editar Telefone"
									type={ButtonType.Button}
								/>
							</div>
						</Dialog.Trigger>

						<Dialog.Portal>
							<Dialog.Overlay className="bg-mauvea-12 fixed inset-0" />

							<Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] p-4 max-w-(--breakpoint-lg) w-[90%] bg-mauve-2 dark:bg-mauvedark-2 rounded-xl overflow-y-auto max-h-[90%]">
								<Dialog.Title asChild>
									<h1 className="mb-4">Editar o Telefone do Aluno</h1>
								</Dialog.Title>

								<RadixForm.Root asChild>
									<Form
										action={`/admin/students/${username}`}
										className="flex flex-col gap-3"
										method="post"
									>
										<RadixForm.Field name="phoneNumber">
											<div className="flex items-baseline justify-between">
												<RadixForm.Label>
													<p>Telefone</p>
												</RadixForm.Label>
											</div>
											<RadixForm.Control asChild>
												<input
													className="w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-hidden"
													defaultValue={studentData.phoneNumber}
													disabled={isSubmittingAnyForm}
													min={3}
													required
													type="text"
												/>
											</RadixForm.Control>
										</RadixForm.Field>

										<RadixForm.Field className="hidden" name="id">
											<RadixForm.Control asChild>
												<input
													disabled={isSubmittingAnyForm}
													type="text"
													value={studentData.id}
												/>
											</RadixForm.Control>
										</RadixForm.Field>

										<RadixForm.Field className="hidden" name="type">
											<RadixForm.Control asChild>
												<input
													disabled={isSubmittingAnyForm}
													type="text"
													value="phoneNumber"
												/>
											</RadixForm.Control>
										</RadixForm.Field>

										<RadixForm.Submit asChild>
											<Button
												className="m-auto mt-2"
												isDisabled={isSubmittingAnyForm}
												preset={ButtonPreset.Primary}
												text="Enviar"
												type={ButtonType.Submit}
											/>
										</RadixForm.Submit>

										{isSubmittingAnyForm && <YemSpinner />}
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
				</div>

				<div className="flex gap-4 mb-10">
					<h3>
						CPF:{' '}
						{studentData.document && studentData.document.length > 3
							? studentData.document
							: 'Pedir para cadastrar CPF'}
					</h3>
					<Dialog.Root
						onOpenChange={setDocumentDialogIsOpen}
						open={documentDialogIsOpen}
					>
						<Dialog.Trigger asChild>
							<div>
								<Button
									preset={ButtonPreset.Secondary}
									text="Editar Documento"
									type={ButtonType.Button}
								/>
							</div>
						</Dialog.Trigger>

						<Dialog.Portal>
							<Dialog.Overlay className="bg-mauvea-12 fixed inset-0" />

							<Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] p-4 max-w-(--breakpoint-lg) w-[90%] bg-mauve-2 dark:bg-mauvedark-2 rounded-xl overflow-y-auto max-h-[90%]">
								<Dialog.Title asChild>
									<h1 className="mb-4">Editar o Documento do Aluno</h1>
								</Dialog.Title>

								<RadixForm.Root asChild>
									<Form
										action={`/admin/students/${username}`}
										className="flex flex-col gap-3"
										method="post"
									>
										<RadixForm.Field name="document">
											<div className="flex items-baseline justify-between">
												<RadixForm.Label>
													<p>Documento (CPF)</p>
												</RadixForm.Label>
											</div>
											<RadixForm.Control asChild>
												<input
													className="w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-hidden"
													defaultValue={studentData.document}
													disabled={isSubmittingAnyForm}
													min={3}
													required
													type="text"
												/>
											</RadixForm.Control>
										</RadixForm.Field>

										<RadixForm.Field className="hidden" name="id">
											<RadixForm.Control asChild>
												<input
													disabled={isSubmittingAnyForm}
													type="text"
													value={studentData.id}
												/>
											</RadixForm.Control>
										</RadixForm.Field>

										<RadixForm.Field className="hidden" name="type">
											<RadixForm.Control asChild>
												<input
													disabled={isSubmittingAnyForm}
													type="text"
													value="document"
												/>
											</RadixForm.Control>
										</RadixForm.Field>

										<RadixForm.Submit asChild>
											<Button
												className="m-auto mt-2"
												isDisabled={isSubmittingAnyForm}
												preset={ButtonPreset.Primary}
												text="Enviar"
												type={ButtonType.Submit}
											/>
										</RadixForm.Submit>

										{isSubmittingAnyForm && <YemSpinner />}
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
				</div>

				<div>
					<div className="flex gap-4 mb-10">
						<h2>Matrículas</h2>

						<RadixForm.Root asChild>
							<Form action={`/admin/students/${username}`} method="post">
								<RadixForm.Field className="hidden" name="id">
									<RadixForm.Control asChild>
										<input
											disabled={isSubmittingAnyForm}
											type="text"
											value={studentData.id}
										/>
									</RadixForm.Control>
								</RadixForm.Field>

								<RadixForm.Field className="hidden" name="type">
									<RadixForm.Control asChild>
										<input
											disabled={isSubmittingAnyForm}
											type="text"
											value="subscriptions"
										/>
									</RadixForm.Control>
								</RadixForm.Field>

								<RadixForm.Submit asChild>
									<Button
										isDisabled={isSubmittingAnyForm}
										preset={ButtonPreset.Secondary}
										text="Resetar Matrículas"
										type={ButtonType.Submit}
									/>
								</RadixForm.Submit>

								{isSubmittingAnyForm && <YemSpinner />}
							</Form>
						</RadixForm.Root>
					</div>

					{subscriptions && (
						<ul>
							{subscriptions.map((subscription) => (
								<li key={subscription.id}>
									<h3>
										{subscription.course.name} - {subscription.provider} -{' '}
										{subscription.providerSubscriptionId}
									</h3>
									<p>{subscription.expiresAt.toLocaleDateString()}</p>
								</li>
							))}
						</ul>
					)}
				</div>

				<div className="mt-44">
					<h2>ATENÇÃO: o botão abaixo vai deletar o usuário atual:</h2>

					<div className="w-fit">
						<Dialog.Root
							onOpenChange={setDocumentDialogIsOpen}
							open={documentDialogIsOpen}
						>
							<Dialog.Trigger asChild>
								<div>
									<Button
										preset={ButtonPreset.Secondary}
										text="Deletar Cadastro"
										type={ButtonType.Button}
									/>
								</div>
							</Dialog.Trigger>

							<Dialog.Portal>
								<Dialog.Overlay className="bg-mauvea-12 fixed inset-0" />

								<Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] p-4 max-w-(--breakpoint-lg) w-[90%] bg-mauve-2 dark:bg-mauvedark-2 rounded-xl overflow-y-auto max-h-[90%]">
									<Dialog.Title asChild>
										<h1 className="mb-4">
											Deletar o Aluno {studentData.firstName}{' '}
											{studentData.lastName}
										</h1>
									</Dialog.Title>

									<RadixForm.Root asChild>
										<Form
											action={`/admin/students/${username}`}
											className="flex flex-col gap-3"
											method="post"
										>
											<RadixForm.Field className="hidden" name="id">
												<RadixForm.Control asChild>
													<input
														disabled={isSubmittingAnyForm}
														type="text"
														value={studentData.id}
													/>
												</RadixForm.Control>
											</RadixForm.Field>

											<RadixForm.Field className="hidden" name="type">
												<RadixForm.Control asChild>
													<input
														disabled={isSubmittingAnyForm}
														type="text"
														value="delete"
													/>
												</RadixForm.Control>
											</RadixForm.Field>

											<div className="w-fit">
												<RadixForm.Submit asChild>
													<Button
														isDisabled={isSubmittingAnyForm}
														preset={ButtonPreset.Primary}
														text="Deletar Cadastro"
														type={ButtonType.Submit}
													/>
												</RadixForm.Submit>
											</div>

											{isSubmittingAnyForm && <YemSpinner />}
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
					</div>
				</div>
			</>
		)
	);
}
