import React from 'react';
import * as RadixForm from '@radix-ui/react-form';
import {Button, ButtonPreset} from '~/components/button';
import {
	json, type ActionFunctionArgs, type LoaderFunctionArgs, redirect,
} from '@remix-run/node';
import {
	Form, Link, useLoaderData, useNavigation,
} from '@remix-run/react';
import {yemApiRequest} from '~/utils/request.server';
import {getUserSession, commitUserSession} from '~/utils/session.server';
import {type TypeUserSession} from '~/types/userSession.type';
import {YemSpinner} from '~/components/yemSpinner';

export const action = async ({request}: ActionFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));

	try {
		const formData = await request.formData();
		const username = formData.get('email');
		const password = formData.get('password');

		const response = await yemApiRequest.post('/users/login', {
			username,
			password,
		});

		const {id, email, roles, firstName, lastName, phoneNumber} = response.data.userData as TypeUserSession;

		userSession.set('id', id);
		userSession.set('email', email);
		userSession.set('roles', roles);
		userSession.set('firstName', firstName);
		userSession.set('lastName', lastName);
		userSession.set('phoneNumber', phoneNumber);

		return redirect('/', {
			headers: {
				'Set-Cookie': await commitUserSession(userSession),
			},
		});
	} catch (error) {
		userSession.unset('id');
		userSession.unset('email');
		userSession.unset('roles');
		userSession.unset('firstName');
		userSession.unset('lastName');
		userSession.unset('phoneNumber');
		userSession.flash('error', 'Usuário ou senha inválidos');

		return redirect('/login', {
			headers: {
				'Set-Cookie': await commitUserSession(userSession),
			},
		});
	}
};

export const loader = async ({request}: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));

	if (userSession.has('id')) {
		return redirect('/');
	}

	const data = {
		error: userSession.get('error') as string | undefined,
		// eslint-disable-next-line @typescript-eslint/naming-convention
		ENV: {
			// eslint-disable-next-line @typescript-eslint/naming-convention
			YEM_API_BASE_URL: process.env.YEM_API_BASE_URL,
		},
	};

	return json(data, {
		headers: {
			'Set-Cookie': await commitUserSession(userSession),
		},
	});
};

const Login = () => {
	const data: {
		error?: string;
		ENV: {
			YEM_API_BASE_URL: string;
		};
	} = useLoaderData();

	const navigation = useNavigation();
	const isSubmitting = navigation.formAction === '/login';

	return (
		<main className='flex flex-col flex-grow-[0.6]'>
			<div className='my-auto'>
				<RadixForm.Root method='post' asChild>
					<Form action='/login' className='w-[260px] mx-auto flex flex-col'>
						<RadixForm.Field className='grid mb-[10px]' name='email'>
							<div className='flex items-baseline justify-between'>
								<RadixForm.Label className='leading-[35px]'>
									<p>Email</p>
								</RadixForm.Label>
								<RadixForm.Message className='text-[13px]' match='valueMissing'>
									<p>Preencha seu email</p>
								</RadixForm.Message>
								<RadixForm.Message className='text-[13px]' match='typeMismatch'>
									<p>Informe um email válido</p>
								</RadixForm.Message>
							</div>
							<RadixForm.Control asChild>
								<input
									disabled={isSubmitting}
									className='w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-none'
									type='email'
									required
								/>
							</RadixForm.Control>
						</RadixForm.Field>
						<RadixForm.Field className='grid mb-[10px]' name='password'>
							<div className='flex items-baseline justify-between'>
								<RadixForm.Label className='leading-[35px]'>
									<p>Senha</p>
								</RadixForm.Label>
								<RadixForm.Message className='text-[13px]' match='valueMissing'>
									<p>Preencha a sua senha</p>
								</RadixForm.Message>
							</div>
							<RadixForm.Control asChild>
								<input
									disabled={isSubmitting}
									className='w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-none'
									type='password'
									required
								/>
							</RadixForm.Control>
						</RadixForm.Field>
						<RadixForm.Field className='hidden' name='YEM_API_BASE_URL'>
							<RadixForm.FormControl asChild>
								<input type='text' value={data?.ENV?.YEM_API_BASE_URL ?? ''}/>
							</RadixForm.FormControl>
						</RadixForm.Field>
						{data?.error
						&& <p className='text-center text-mauve-12 dark:text-mauvedark-11 font-gothamMedium'>{data.error}</p>
						}
						<RadixForm.Submit asChild>
							<Button disabled={isSubmitting} className='m-auto mt-2' text='Fazer Login' preset={ButtonPreset.Primary} />
						</RadixForm.Submit>
						{isSubmitting && (
							<YemSpinner />
						)}
					</Form>
				</RadixForm.Root>
				<div className='m-3'>
					<Link to='/new-password'>
						<p className='text-center text-xs text-mauve-11 dark:text-mauvedark-10'>gerar uma nova senha</p>
					</Link>
				</div>
			</div>
		</main>
	);
};

export default Login;
