/* eslint-disable @typescript-eslint/naming-convention */
import * as RadixForm from '@radix-ui/react-form';
import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	unstable_defineAction as defineAction,
	unstable_defineLoader as defineLoader,
	unstable_data as data,
} from '@remix-run/node';
import {
	Form,
	Link,
	type MetaArgs_SingleFetch,
	redirect,
	useLoaderData,
	useNavigation,
} from '@remix-run/react';
import {Separator} from '@radix-ui/react-separator';
import {Button, ButtonPreset, ButtonType} from '~/components/button.js';
import {getUserSession, commitUserSession} from '~/utils/session.server';
import {type TypeUserSession} from '~/types/user-session.type';
import {YemSpinner} from '~/components/yem-spinner.js';
import {UserService} from '~/services/user.service.server';
import {logger} from '~/utils/logger.util';
import {NavigateBar} from '~/components/navigation-bar.js';

export const meta = ({data}: MetaArgs_SingleFetch<typeof loader>) => [
	{title: 'Yoga em Movimento - Entrar'},
	{name: 'description', content: 'Faça o login para acessar a plataforma do Yoga em Movimento.'},
	...(data! as unknown as LoaderData).meta,
];

type LoaderData = {
	error: string | undefined;
	meta: Array<{
		tagName: string;
		rel: string;
		href: string;
	}>;
	userData: TypeUserSession;
};

export const loader = defineLoader(async ({request}: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));

	if (userSession.has('id')) {
		return redirect('/courses');
	}

	return data(
		{
			error: userSession.get('error') as string | undefined,
			meta: [{tagName: 'link', rel: 'canonical', href: new URL('/login', request.url).toString()}],
			userData: userSession.data as TypeUserSession,
		},
		{
			headers: {
				'Set-Cookie': await commitUserSession(userSession),
			},
		},
	);
});

export const action = defineAction(async ({request}: ActionFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));

	try {
		const formData = await request.formData();
		const username = formData.get('email');
		const password = formData.get('password');

		const userService = new UserService();

		const userServiceResponse = await userService.login(username as string, password as string);

		const {id, email, roles, firstName, lastName, phoneNumber} = userServiceResponse.data.userData as TypeUserSession;

		userSession.set('id', id);
		userSession.set('email', email);
		userSession.set('roles', roles);
		userSession.set('firstName', firstName);
		userSession.set('lastName', lastName);
		userSession.set('phoneNumber', phoneNumber);
	} catch (error) {
		logger.logError(`Error logging in: ${(error as Error).message}`);

		userSession.unset('id');
		userSession.unset('email');
		userSession.unset('roles');
		userSession.unset('firstName');
		userSession.unset('lastName');
		userSession.unset('phoneNumber');
		userSession.flash('error', 'Usuário ou senha inválidos');
	}

	return data({}, {headers: {'Set-Cookie': await commitUserSession(userSession)}});
});

export default function Login() {
	const {error, userData} = useLoaderData<typeof loader>() as unknown as LoaderData;

	const navigation = useNavigation();
	const isSubmitting = navigation.formAction === '/login';

	return (
		<>
			<NavigateBar userData={userData}/>

			<main className='flex flex-col flex-grow-[0.6] mt-20'>
				<div className='my-auto'>
					<RadixForm.Root asChild method='post'>
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
										required
										disabled={isSubmitting}
										className='w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-none'
										type='email'
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
										required
										disabled={isSubmitting}
										className='w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-none'
										type='password'
									/>
								</RadixForm.Control>
							</RadixForm.Field>
							{error
						&& <p className='text-center text-mauve-12 dark:text-mauvedark-11 font-gothamMedium'>{error}</p>}
							<RadixForm.Submit asChild>
								<Button isDisabled={isSubmitting} className='m-auto mt-2' text='Fazer Login' preset={ButtonPreset.Primary} type={ButtonType.Submit}/>
							</RadixForm.Submit>
							{isSubmitting && (
								<YemSpinner/>
							)}
						</Form>
					</RadixForm.Root>
					<div className='m-3 w-[260px] mx-auto flex justify-center gap-1'>
						<Link to='/new-password'>
							<p className='text-center text-xs text-mauve-11 dark:text-mauvedark-10'>Gerar uma nova senha</p>
						</Link>
						<Separator
							decorative
							className='bg-mauve-11 dark:bg-mauvedark-11 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-4 data-[orientation=vertical]:w-px'
							orientation='vertical'/>
						<Link to='/register'>
							<p className='text-center text-xs text-mauve-11 dark:text-mauvedark-10'>Criar uma conta</p>
						</Link>
					</div>
				</div>
			</main>
		</>
	);
}
