import React, {useState} from 'react';
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

import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import {type E164Number} from 'libphonenumber-js/core';

export const action = async ({request}: ActionFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));

	if (userSession.has('id')) {
		userSession.flash('error', 'Usuário ou senha inválidos');
		return redirect('/register', {
			headers: {
				'Set-Cookie': await commitUserSession(userSession),
			},
		});
	}

	try {
		const formData = await request.formData();
		const firstName = formData.get('firstName');
		const lastName = formData.get('lastName');
		const email = formData.get('email');
		const phoneNumber = formData.get('phoneNumber');

		const response = await yemApiRequest.post('/users/create-or-fail', {
			firstName,
			lastName,
			email,
			phoneNumber,
		});
	} catch (error) {
		return null;
	}

	return null;
};

export const loader = async ({request}: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));

	if (userSession.get('id')) {
		return redirect('/');
	}

	const data = {
		// eslint-disable-next-line @typescript-eslint/naming-convention
		ENV: {
			// eslint-disable-next-line @typescript-eslint/naming-convention
			YEM_API_BASE_URL: process.env.YEM_API_BASE_URL,
		},
	};

	return json(data);
};

const Register = () => {
	const data: {
		error?: string;
		ENV: {
			YEM_API_BASE_URL: string;
		};
	} = useLoaderData();

	const navigation = useNavigation();
	const isSubmitting = navigation.formAction === '/register';

	const [phoneNumberValue, setPhoneNumberValue] = useState<E164Number>('');

	return (
		<main className='flex flex-col flex-grow-[0.6]'>
			<div className='my-auto'>
				<RadixForm.Root method='post' asChild>
					<Form action='/register' className='w-[260px] mx-auto flex flex-col'>
						<RadixForm.Field name='firstName' className='grid mb-[10px]'>
							<div className='flex items-baseline justify-between'>
								<RadixForm.Label className='leading-[35px]'>
									<p>Nome</p>
								</RadixForm.Label>
								<RadixForm.Message className='text-[13px]' match='valueMissing'>
									<p>Preencha seu nome</p>
								</RadixForm.Message>
								<RadixForm.Message className='text-[13px]' match='tooShort'>
									<p>O sobrenome deve ter no mínimo 3 letras</p>
								</RadixForm.Message>
							</div>
							<RadixForm.Control asChild>
								<input
									disabled={isSubmitting}
									className='w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-none'
									type='text'
									required
									minLength={3}
								/>
							</RadixForm.Control>
						</RadixForm.Field>

						<RadixForm.Field name='lastName' className='grid mb-[10px]'>
							<div className='flex items-baseline justify-between'>
								<RadixForm.Label className='leading-[35px]'>
									<p>Sobrenome</p>
								</RadixForm.Label>
								<RadixForm.Message className='text-[13px]' match='valueMissing'>
									<p>Preencha seu sobrenome</p>
								</RadixForm.Message>
								<RadixForm.Message className='text-[13px]' match='tooShort'>
									<p>O sobrenome deve ter no mínimo 3 letras</p>
								</RadixForm.Message>
							</div>
							<RadixForm.Control asChild>
								<input
									disabled={isSubmitting}
									className='w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-none'
									type='text'
									required
									minLength={3}
								/>
							</RadixForm.Control>
						</RadixForm.Field>

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

						<RadixForm.Field name='phoneNumber' className='grid mb-[10px]'>
							<div className='flex items-baseline justify-between'>
								<RadixForm.Label className='leading-[35px]'>
									<p>WhatsApp</p>
								</RadixForm.Label>
								<RadixForm.Message className='text-[13px]' match='badInput'>
									<p>Preencha seu WhatsApp</p>
								</RadixForm.Message>
							</div>
							<PhoneInput
								name='phoneNumber'
								className='pr-0 w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-none'
								defaultCountry='BR'
								international={true}
								limitMaxLength={true}
								inputComponent={RadixForm.Control}
								numberInputProps={{
									required: true,
									className: 'w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-none',
								}}
								countryCallingCodeEditable={false}
								value={phoneNumberValue}
								onChange={(value?: E164Number) => {
									setPhoneNumberValue(value ?? '');
								}}
							/>
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
			</div>
		</main>
	);
};

export default Register;
