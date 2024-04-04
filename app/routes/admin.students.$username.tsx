import {
	type ActionFunctionArgs, json, redirect, type LoaderFunctionArgs,
} from '@remix-run/node';
import {
	Form, useLoaderData, useNavigation, useParams,
} from '@remix-run/react';
import * as Dialog from '@radix-ui/react-dialog';
import * as RadixForm from '@radix-ui/react-form';
import {useEffect, useState} from 'react';
import {Button, ButtonPreset, ButtonType} from '~/components/button/index.js';
import {UserService} from '~/services/user.service';
import {type TUser} from '~/types/user.type';
import {commitUserSession, getUserSession} from '~/utils/session.server';
import {YemSpinner} from '~/components/yem-spinner/index.js';
import {logger} from '~/utils/logger.util';

type StudentLoaderData = {
	studentData: TUser | undefined;
	error: string | undefined;
	success: string | undefined;
};

export const loader = async ({request, params}: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));
	const {username} = params;

	try {
		const {data: studentData} = await new UserService().getUserData(username!);

		return json<StudentLoaderData>({
			studentData,
			error: userSession.get('error') as string | undefined,
			success: userSession.get('success') as string | undefined,
		}, {
			headers: {
				'Set-Cookie': await commitUserSession(userSession), // eslint-disable-line @typescript-eslint/naming-convention
			},
		});
	} catch {
		userSession.flash('error', `Erro ao buscar dados do aluno ${username}`);

		return redirect('/admin/students', {
			headers: {
				'Set-Cookie': await commitUserSession(userSession), // eslint-disable-line @typescript-eslint/naming-convention
			},
		});
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

				userSession.flash('success', 'Nome do aluno atualizado com sucesso');
				return redirect(`/admin/students/${username}`, {
					headers: {
						'Set-Cookie': await commitUserSession(userSession), // eslint-disable-line @typescript-eslint/naming-convention
					},
				});
			}

			case 'email': {
				const id = formData.get('id') as string;
				const oldEmail = formData.get('oldEmail') as string;
				const newEmail = formData.get('newEmail') as string;

				await userService.updateUserEmail(id, oldEmail, newEmail);

				userSession.flash('success', 'Email do aluno atualizado com sucesso');

				return redirect(`/admin/students/${newEmail}`, {
					headers: {
						'Set-Cookie': await commitUserSession(userSession), // eslint-disable-line @typescript-eslint/naming-convention
					},
				});
			}

			case 'phoneNumber': {
				const id = formData.get('id') as string;
				const phoneNumber = formData.get('phoneNumber') as string;

				await userService.updateUserPhoneNumber(id, phoneNumber);

				userSession.flash('success', 'Telefone do aluno atualizado com sucesso');

				return redirect(`/admin/students/${username}`, {
					headers: {
						'Set-Cookie': await commitUserSession(userSession), // eslint-disable-line @typescript-eslint/naming-convention
					},
				});
			}

			case 'document': {
				const id = formData.get('id') as string;
				const document = formData.get('document') as string;

				await userService.updateUserDocument(id, document);

				userSession.flash('success', 'Documento do aluno atualizado com sucesso');

				return redirect(`/admin/students/${username}`, {
					headers: {
						'Set-Cookie': await commitUserSession(userSession), // eslint-disable-line @typescript-eslint/naming-convention
					},
				});
			}

			default: {
				userSession.flash('error', 'Tipo de formulário inválido');
				return redirect(`/admin/students/${username}`, {
					headers: {
						'Set-Cookie': await commitUserSession(userSession), // eslint-disable-line @typescript-eslint/naming-convention
					},
				});
			}
		}
	} catch (error) {
		logger.logError(`Erro ao editar ${formType} do aluno ${username}: ${(error as Error).message}`);
		userSession.flash('error', (error as Error).message);
		return redirect(`/admin/students/${username}`, {
			headers: {
				'Set-Cookie': await commitUserSession(userSession), // eslint-disable-line @typescript-eslint/naming-convention
			},
		});
	}
};

export default function Student() {
	const {
		error,
		success,
		studentData,
	} = useLoaderData<StudentLoaderData>();

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
			{(success ?? error) && (
				<p className='mb-4 text-lg'>
					{success ?? error}
				</p>
			)}

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
						</Dialog.Content>
					</Dialog.Portal>
				</Dialog.Root>
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
						</Dialog.Content>
					</Dialog.Portal>
				</Dialog.Root>
			</div>

			<div>
				{/* eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing */}
				<h3>{studentData.document || 'Pedir para cadastrar CPF'}</h3>
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
						</Dialog.Content>
					</Dialog.Portal>
				</Dialog.Root>
			</div>
		</>
	);
}
