import {useState} from 'react';
import * as RadixForm from '@radix-ui/react-form';
import {
	json, type ActionFunctionArgs, type LoaderFunctionArgs, redirect,
} from '@remix-run/node';
import {
	Form, Link, type MetaFunction, useLoaderData, useNavigation,
} from '@remix-run/react';
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import {type E164Number} from 'libphonenumber-js/core'; // eslint-disable-line import/no-extraneous-dependencies
import {getUserSession, commitUserSession} from '~/utils/session.server';
import {YemSpinner} from '~/components/yem-spinner/index.js';
import {UserService} from '~/services/user.service.server';
import {Button, ButtonPreset, ButtonType} from '~/components/button/index.js';
import type {CustomError} from '~/utils/custom-error';
import {logger} from '~/utils/logger.util.js';

export const meta: MetaFunction = () => [
	{title: 'Yoga em Movimento - Cadastro'},
	{name: 'description', content: 'Crie sua conta no Yoga em Movimento e tenha acesso a conteúdos exclusivos.'},
];

export const action = async ({request}: ActionFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));

	if (userSession.has('id')) {
		userSession.flash('error', 'Usuário já logado, faça o login para continuar');
		return redirect('/register', {
			headers: {
				'Set-Cookie': await commitUserSession(userSession), // eslint-disable-line @typescript-eslint/naming-convention
			},
		});
	}

	try {
		const formData = await request.formData();
		const firstName = formData.get('firstName');
		const lastName = formData.get('lastName');
		const email = formData.get('email');
		const phoneNumber = formData.get('phoneNumber');

		const userService = new UserService();

		await userService.createOrFail({
			firstName: firstName as string,
			lastName: lastName as string,
			email: email as string,
			phoneNumber: phoneNumber as string,
		});

		userSession.flash('success', 'Usuário criado com sucesso, em alguns instantes você vai receber a senha por email e WhatsApp. Utilize-a em conjunto com seu email para fazer o login');

		return redirect('/register', {
			headers: {
				'Set-Cookie': await commitUserSession(userSession), // eslint-disable-line @typescript-eslint/naming-convention
			},
		});
	} catch (error) {
		logger.logError(`Error: ${(error as CustomError).message}`);
		userSession.flash('error', (error as CustomError).message);
		return redirect('/register', {
			headers: {
				'Set-Cookie': await commitUserSession(userSession), // eslint-disable-line @typescript-eslint/naming-convention
			},
		});
	}
};

export const loader = async ({request}: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));

	if (userSession.get('id')) {
		return redirect('/');
	}

	const data = {
		error: userSession.get('error') as string | undefined,
		success: userSession.get('success') as string | undefined,
	};

	return json(data);
};

export default function Register() {
	const data: {
		error?: string;
		success?: string;
	} = useLoaderData();

	const navigation = useNavigation();
	const isSubmitting = navigation.formAction === '/register';

	const [phoneNumberValue, setPhoneNumberValue] = useState<E164Number>('');

	return (
		<main className='flex flex-col flex-grow-[0.6] mt-20'>
			<div className='w-[260px] mx-auto my-auto flex flex-col'>
				{data?.success
					? <p className='text-center font-gothamMedium'>{data.success}</p>
					: <p className='mb-3 text-center'>Preencha os dados abaixo para criar a sua conta do Yoga em Movimento. Com ela você poderá acessar os conteúdos gratuitos</p>}
				<RadixForm.Root asChild method='post'>
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
									required
									disabled={isSubmitting}
									className='w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-none'
									type='text'
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
									required
									disabled={isSubmitting}
									className='w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-none'
									type='text'
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
									required
									disabled={isSubmitting}
									className='w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-none'
									type='email'
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
								international
								limitMaxLength
								name='phoneNumber'
								className='pr-0 w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-none'
								defaultCountry='BR'
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
						&& <p className='text-center text-mauve-12 dark:text-mauvedark-11 font-gothamMedium'>{data.error}</p>}

						<RadixForm.Submit asChild>
							<Button isDisabled={isSubmitting} className='m-auto mt-2' text='Criar Minha Conta' preset={ButtonPreset.Primary} type={ButtonType.Submit}/>
						</RadixForm.Submit>

						{isSubmitting && <YemSpinner/>}

					</Form>
				</RadixForm.Root>
				<div className='m-3 w-[260px] mx-auto flex justify-center gap-1'>
					<Link to='/login'>
						<p className='text-center text-xs text-mauve-11 dark:text-mauvedark-10'>Fazer login</p>
					</Link>
				</div>
			</div>
		</main>
	);
}
