/** biome-ignore-all lint/style/noNonNullAssertion: . */
import * as RadixForm from '@radix-ui/react-form';
import { useState } from 'react';
import {
	type ActionFunctionArgs,
	data,
	Form,
	Link,
	type LoaderFunctionArgs,
	type MetaArgs,
	redirect,
	useLoaderData,
	useNavigation,
} from 'react-router';
import 'react-phone-number-input/style.css';
import type { E164Number } from 'libphonenumber-js/core'; // eslint-disable-line import/no-extraneous-dependencies
import PhoneInput from 'react-phone-number-input';
import { Button, ButtonPreset, ButtonType } from '~/components/button.js';
import { NavigateBar } from '~/components/navigation-bar.js';
import { YemSpinner } from '~/components/yem-spinner.js';
import { UserService } from '~/services/user.service.server';
import type { TypeUserSession } from '~/types/user-session.type';
import type { CustomError } from '~/utils/custom-error';
import { logger } from '~/utils/logger.util.js';
import { commitUserSession, getUserSession } from '~/utils/session.server';

export const meta = ({ data }: MetaArgs<typeof loader>) => [
	{ title: 'Yoga em Movimento - Cadastro' },
	{
		content:
			'Crie sua conta no Yoga em Movimento e tenha acesso a conteúdos exclusivos.',
		name: 'description',
	},
	...(
		data! as {
			error: string | undefined;
			success: string | undefined;
			meta: Array<{
				tagName: string;
				rel: string;
				href: string;
			}>;
			userData: TypeUserSession;
		}
	).meta,
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));

	if (userSession.data.id) {
		return redirect('/courses');
	}

	return {
		error: userSession.get('error') as string | undefined,
		meta: [
			{
				href: new URL('/register', request.url).toString(),
				rel: 'canonical',
				tagName: 'link',
			},
		],
		success: userSession.get('success') as string | undefined,
		userData: userSession.data as TypeUserSession,
	};
};

export const action = async ({ request }: ActionFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));

	try {
		const formData = await request.formData();
		const firstName = formData.get('firstName');
		const lastName = formData.get('lastName');
		const email = formData.get('email');
		const phoneNumber = formData.get('phoneNumber');

		const userService = new UserService();

		await userService.createOrFail({
			email: email as string,
			firstName: firstName as string,
			lastName: lastName as string,
			phoneNumber: phoneNumber as string,
		});

		userSession.flash(
			'success',
			'Usuário criado com sucesso, em alguns instantes você vai receber a senha por email e WhatsApp. Utilize-a em conjunto com seu email para fazer o login',
		);
	} catch (error) {
		logger.logError(`Error: ${(error as CustomError).message}`);
		userSession.flash('error', (error as CustomError).message);
	}

	return data(
		{},
		{ headers: { 'Set-Cookie': await commitUserSession(userSession) } },
	);
};

export default function Register() {
	const { success, error, userData } = useLoaderData<typeof loader>() as {
		error: string | undefined;
		success: string | undefined;
		meta: Array<{
			tagName: string;
			rel: string;
			href: string;
		}>;
		userData: TypeUserSession;
	};

	const navigation = useNavigation();
	const isSubmitting = navigation.formAction === '/register';

	const [phoneNumberValue, setPhoneNumberValue] = useState<E164Number>();

	return (
		<>
			<NavigateBar userData={userData} />

			<main className="flex flex-col flex-grow-[0.6] mt-20">
				<div className="w-[260px] mx-auto my-auto flex flex-col">
					{success ? (
						<p className="text-center font-gothamMedium">{success}</p>
					) : (
						<p className="mb-3 text-center">
							Preencha os dados abaixo para criar a sua conta do Yoga em
							Movimento. Com ela você poderá acessar os conteúdos gratuitos
						</p>
					)}
					<RadixForm.Root asChild method="post">
						<Form
							action="/register"
							className="w-[260px] mx-auto flex flex-col"
						>
							<RadixForm.Field className="grid mb-[10px]" name="firstName">
								<div className="flex items-baseline justify-between">
									<RadixForm.Label className="leading-[35px]">
										<p>Nome</p>
									</RadixForm.Label>
									<RadixForm.Message
										className="text-[13px]"
										match="valueMissing"
									>
										<p>Preencha seu nome</p>
									</RadixForm.Message>
									<RadixForm.Message className="text-[13px]" match="tooShort">
										<p>O sobrenome deve ter no mínimo 3 letras</p>
									</RadixForm.Message>
								</div>
								<RadixForm.Control asChild>
									<input
										className="w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-hidden"
										disabled={isSubmitting}
										minLength={3}
										required
										type="text"
									/>
								</RadixForm.Control>
							</RadixForm.Field>

							<RadixForm.Field className="grid mb-[10px]" name="lastName">
								<div className="flex items-baseline justify-between">
									<RadixForm.Label className="leading-[35px]">
										<p>Sobrenome</p>
									</RadixForm.Label>
									<RadixForm.Message
										className="text-[13px]"
										match="valueMissing"
									>
										<p>Preencha seu sobrenome</p>
									</RadixForm.Message>
									<RadixForm.Message className="text-[13px]" match="tooShort">
										<p>O sobrenome deve ter no mínimo 3 letras</p>
									</RadixForm.Message>
								</div>
								<RadixForm.Control asChild>
									<input
										className="w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-hidden"
										disabled={isSubmitting}
										minLength={3}
										required
										type="text"
									/>
								</RadixForm.Control>
							</RadixForm.Field>

							<RadixForm.Field className="grid mb-[10px]" name="email">
								<div className="flex items-baseline justify-between">
									<RadixForm.Label className="leading-[35px]">
										<p>Email</p>
									</RadixForm.Label>
									<RadixForm.Message
										className="text-[13px]"
										match="valueMissing"
									>
										<p>Preencha seu email</p>
									</RadixForm.Message>
									<RadixForm.Message
										className="text-[13px]"
										match="typeMismatch"
									>
										<p>Informe um email válido</p>
									</RadixForm.Message>
								</div>
								<RadixForm.Control asChild>
									<input
										className="w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-hidden"
										disabled={isSubmitting}
										required
										type="email"
									/>
								</RadixForm.Control>
							</RadixForm.Field>

							<RadixForm.Field className="grid mb-[10px]" name="phoneNumber">
								<div className="flex items-baseline justify-between">
									<RadixForm.Label className="leading-[35px]">
										<p>WhatsApp</p>
									</RadixForm.Label>
									<RadixForm.Message className="text-[13px]" match="badInput">
										<p>Preencha seu WhatsApp</p>
									</RadixForm.Message>
								</div>
								<PhoneInput
									className="pr-0 w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-hidden"
									countryCallingCodeEditable={false}
									defaultCountry="BR"
									inputComponent={RadixForm.Control}
									international
									limitMaxLength
									name="phoneNumber"
									numberInputProps={{
										className:
											'w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-hidden',
										required: true,
									}}
									onChange={(value?: E164Number) => {
										setPhoneNumberValue(value);
									}}
									value={phoneNumberValue}
								/>
							</RadixForm.Field>

							{error && (
								<p className="text-center text-mauve-12 dark:text-mauvedark-11 font-gothamMedium">
									{error}
								</p>
							)}

							<RadixForm.Submit asChild>
								<Button
									className="m-auto mt-2"
									isDisabled={isSubmitting}
									preset={ButtonPreset.Primary}
									text="Criar Minha Conta"
									type={ButtonType.Submit}
								/>
							</RadixForm.Submit>

							{isSubmitting && <YemSpinner />}
						</Form>
					</RadixForm.Root>
					<div className="m-3 w-[260px] mx-auto flex justify-center gap-1">
						<Link to="/login">
							<p className="text-center text-xs text-mauve-11 dark:text-mauvedark-10">
								Fazer login
							</p>
						</Link>
					</div>
				</div>
			</main>
		</>
	);
}
