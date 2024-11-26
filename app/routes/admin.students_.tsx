/* eslint-disable @typescript-eslint/naming-convention */
import * as Form from '@radix-ui/react-form';
import {
	type LoaderFunctionArgs, type ActionFunctionArgs, data, type MetaArgs, redirect, Form as RemixForm, useLoaderData, useNavigation,
} from 'react-router';
import {SuccessOrErrorMessage} from '~/components/admin-success-or-error-message.js';
import {Button, ButtonPreset, ButtonType} from '~/components/button.js';
import {YemSpinner} from '~/components/yem-spinner.js';
import {UserService} from '~/services/user.service.server';
import {commitUserSession, getUserSession} from '~/utils/session.server';

export const meta = ({data}: MetaArgs<typeof loader>) => ([
	{title: 'Alunos - Yoga em Movimento'},
	{name: 'description', content: 'Página de alunos do Yoga em Movimento'},
	{name: 'robots', content: 'noindex, nofollow'},
	...data!.meta,
]);

export const loader = async ({request}: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));

	const meta = [
		{tagName: 'link', rel: 'canonical', href: new URL('/admin/students', request.url).toString()},
	];

	return {
		error: userSession.get('error') as string | undefined,
		success: userSession.get('success') as string | undefined,
		meta,
	};
};

export const action = async ({request}: ActionFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));

	try {
		const formData = await request.formData();
		const username = formData.get('username') as string;

		const {data: existUser} = await new UserService().verifyUserExists(username);

		if (existUser) {
			return redirect(`/admin/students/${username}`);
		}

		userSession.flash('error', `Usuário ${username} não encontrado`);

		return data({}, {headers: {'Set-Cookie': await commitUserSession(userSession)}});
	} catch {
		userSession.flash('error', 'Erro ao pesquisar usuário');

		return data({}, {headers: {'Set-Cookie': await commitUserSession(userSession)}});
	}
};

export default function Students() {
	const {
		error,
		success,
	} = useLoaderData<typeof loader>();

	const navigation = useNavigation();
	const isSubmittingForm = navigation.formAction === '/admin/students';

	return (
		<>
			<SuccessOrErrorMessage success={success} error={error}/>

			<h1>Alunos</h1>

			<Form.Root>
				<RemixForm method='post' action='/admin/students'>

					<Form.Field name='username'>
						<div className='flex items-baseline justify-between'>
							<Form.Label>
								<p>Email do aluno</p>
							</Form.Label>
						</div>
						<Form.Control asChild>
							<input
								required
								disabled={isSubmittingForm}
								type='text'
								min={8}
								className='w-full max-w-72 bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-none'
							/>
						</Form.Control>
					</Form.Field>

					<Form.Submit asChild>
						<Button isDisabled={isSubmittingForm} className='m-auto mt-2' text='Pesquisar' preset={ButtonPreset.Primary} type={ButtonType.Submit}/>
					</Form.Submit>

					{isSubmittingForm && <YemSpinner/>}

				</RemixForm>
			</Form.Root>
		</>
	);
}
