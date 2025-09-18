/** biome-ignore-all lint/style/noNonNullAssertion: . */
import * as Form from '@radix-ui/react-form';
import {
	type ActionFunctionArgs,
	data,
	type LoaderFunctionArgs,
	type MetaArgs,
	Form as RemixForm,
	redirect,
	useLoaderData,
	useNavigation,
} from 'react-router';
import { SuccessOrErrorMessage } from '~/components/admin-success-or-error-message.js';
import { Button, ButtonPreset, ButtonType } from '~/components/button.js';
import { YemSpinner } from '~/components/yem-spinner.js';
import { UserService } from '~/services/user.service.server';
import { commitUserSession, getUserSession } from '~/utils/session.server';

export const meta = ({ data }: MetaArgs<typeof loader>) => [
	{ title: 'Alunos - Yoga em Movimento' },
	{ content: 'Página de alunos do Yoga em Movimento', name: 'description' },
	{ content: 'noindex, nofollow', name: 'robots' },
	...data!.meta,
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));

	const meta = [
		{
			href: new URL('/admin/students', request.url).toString(),
			rel: 'canonical',
			tagName: 'link',
		},
	];

	return {
		error: userSession.get('error') as string | undefined,
		meta,
		success: userSession.get('success') as string | undefined,
	};
};

export const action = async ({ request }: ActionFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));

	try {
		const formData = await request.formData();
		const username = formData.get('username') as string;

		const { data: existUser } = await new UserService().verifyUserExists(
			username,
		);

		if (existUser) {
			return redirect(`/admin/students/${username}`);
		}

		userSession.flash('error', `Usuário ${username} não encontrado`);

		return data(
			{},
			{ headers: { 'Set-Cookie': await commitUserSession(userSession) } },
		);
	} catch {
		userSession.flash('error', 'Erro ao pesquisar usuário');

		return data(
			{},
			{ headers: { 'Set-Cookie': await commitUserSession(userSession) } },
		);
	}
};

export default function Students() {
	const { error, success } = useLoaderData<typeof loader>();

	const navigation = useNavigation();
	const isSubmittingForm = navigation.formAction === '/admin/students';

	return (
		<>
			<SuccessOrErrorMessage error={error} success={success} />

			<h1>Alunos</h1>

			<Form.Root>
				<RemixForm action="/admin/students" method="post">
					<Form.Field name="username">
						<div className="flex items-baseline justify-between">
							<Form.Label>
								<p>Email do aluno</p>
							</Form.Label>
						</div>
						<Form.Control asChild>
							<input
								className="w-full max-w-72 bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-hidden"
								disabled={isSubmittingForm}
								min={8}
								required
								type="text"
							/>
						</Form.Control>
					</Form.Field>

					<Form.Submit asChild>
						<Button
							className="m-auto mt-2"
							isDisabled={isSubmittingForm}
							preset={ButtonPreset.Primary}
							text="Pesquisar"
							type={ButtonType.Submit}
						/>
					</Form.Submit>

					{isSubmittingForm && <YemSpinner />}
				</RemixForm>
			</Form.Root>
		</>
	);
}
