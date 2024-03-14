import React from 'react';
import * as RadixForm from '@radix-ui/react-form';
import {Button, ButtonPreset} from '~/components/button';
import {
	json, type ActionFunctionArgs, type LoaderFunctionArgs, redirect,
} from '@remix-run/node';
import {Form, useLoaderData} from '@remix-run/react';
import {yemApiRequest} from '~/utils/request.server';
import {getUserSession, commitUserSession} from '~/utils/session.server';
import {type TypeUserSession} from '~/types/userSession.type';

export const action = async ({request}: ActionFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));

	const formData = await request.formData();
	const username = formData.get('email');
	const password = formData.get('password');

	const response = await yemApiRequest.post('/users/login', {
		username,
		password,
	});

	if (!response.data.userData) {
		userSession.flash('error', 'Usuário ou senha inválidos');

		return redirect('/login', {
			headers: {
				'Set-Cookie': await commitUserSession(userSession),
			},
		});
	}

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
		ENV: {
			YEM_API_BASE_URL: string;
		};
	} = useLoaderData();

	return (
		<div className='flex flex-col flex-grow-[0.6]'>
			<RadixForm.Root method='post' className='w-[260px] mx-auto my-auto flex flex-col' asChild>
				<Form>
					<RadixForm.Field className='grid mb-[10px]' name='email'>
						<div className='flex items-baseline justify-between'>
							<RadixForm.Label className='text-[15px] font-medium leading-[35px] text-white'>Email</RadixForm.Label>
							<RadixForm.Message className='text-[13px]' match='valueMissing'>
								<p>Preencha seu email</p>
							</RadixForm.Message>
							<RadixForm.Message className='text-[13px]' match='typeMismatch'>
								<p>Informe um email válido</p>
							</RadixForm.Message>
						</div>
						<RadixForm.Control asChild>
							<input
								className='box-border w-full bg-blackA2 shadow-blackA6 inline-flex h-[35px] appearance-none items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none text-white shadow-[0_0_0_1px] outline-none hover:shadow-[0_0_0_1px_black] focus:shadow-[0_0_0_2px_black] selection:color-white selection:bg-blackA6'
								type='email'
								required
							/>
						</RadixForm.Control>
					</RadixForm.Field>
					<RadixForm.Field className='grid mb-[10px]' name='password'>
						<div className='flex items-baseline justify-between'>
							<RadixForm.Label className='text-[15px] font-medium leading-[35px]'>
								<p>Senha</p>
							</RadixForm.Label>
							<RadixForm.Message className='text-[13px]' match='valueMissing'>
								<p>Preencha a sua senha</p>
							</RadixForm.Message>
						</div>
						<RadixForm.Control asChild>
							<input
								className='box-border w-full bg-blackA2 shadow-blackA6 inline-flex h-[35px] appearance-none items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none text-white shadow-[0_0_0_1px] outline-none hover:shadow-[0_0_0_1px_black] focus:shadow-[0_0_0_2px_black] selection:color-white selection:bg-blackA6'
								type='password'
								required
							/>
						</RadixForm.Control>
					</RadixForm.Field>
					<RadixForm.Field className='hidden' name='YEM_API_BASE_URL'>
						<RadixForm.FormControl asChild>
							<input type='text' value={data.ENV.YEM_API_BASE_URL}/>
						</RadixForm.FormControl>
					</RadixForm.Field>
					<RadixForm.Submit asChild>
						<Button className='m-auto' text='Fazer Login' preset={ButtonPreset.Primary} />
					</RadixForm.Submit>
				</Form>
			</RadixForm.Root>
		</div>
	);
};

export default Login;
