/** biome-ignore-all lint/style/noNonNullAssertion: . */
import * as RadixForm from '@radix-ui/react-form';
import { Separator } from '@radix-ui/react-separator';
import {
	type ActionFunctionArgs,
	Form,
	Link,
	type LoaderFunctionArgs,
	type MetaArgs,
	redirect,
	useLoaderData,
	useNavigation,
} from 'react-router';
import { Button, ButtonPreset, ButtonType } from '~/components/button.js';
import { NavigateBar } from '~/components/navigation-bar.js';
import { YemSpinner } from '~/components/yem-spinner.js';
import { UserService } from '~/services/user.service.server';
import type { TypeUserSession } from '~/types/user-session.type';
import { logger } from '~/utils/logger.util';
import { getUserSession } from '~/utils/session.server';

export const meta = ({ data }: MetaArgs<typeof loader>) => [
	{ title: 'Yoga em Movimento - Nova Senha' },
	{
		content:
			'Gere uma nova senha para acessar a plataforma do Yoga em Movimento.',
		name: 'description',
	},
	...data!.meta,
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));

	return {
		meta: [
			{
				href: new URL('/new-password', request.url).toString(),
				rel: 'canonical',
				tagName: 'link',
			},
		],
		userData: userSession.data as TypeUserSession,
	};
};

export const action = async ({ request }: ActionFunctionArgs) => {
	try {
		const formData = await request.formData();
		const email = formData.get('email');

		await new UserService().getNewPassword(email as string);
	} catch (error) {
		logger.logError(
			`Error generating new password: ${(error as Error).message}`,
		);
	}

	return redirect('/login');
};

export default function NewPassword() {
	const navigation = useNavigation();
	const isSubmitting = navigation.formAction === '/new-password';
	const { userData } = useLoaderData<typeof loader>();

	return (
		<>
			<NavigateBar userData={userData} />

			<main className="flex flex-col flex-grow-[0.6] mt-20">
				<div className="w-[260px] mx-auto my-auto flex flex-col">
					<p className="mb-3 text-center">
						Para gerar uma nova senha, preencha o seu email de acesso abaixo e
						envie o formulário. Em poucos instantes você receberá a nova senha
						no seu email e no seu Whatsapp
					</p>
					<RadixForm.Form
						action="/new-password"
						asChild
						className="w-[260px] mx-auto my-auto flex flex-col"
						method="post"
						noValidate
					>
						<Form>
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
							<RadixForm.Submit asChild>
								<Button
									className="m-auto"
									isDisabled={isSubmitting}
									preset={ButtonPreset.Primary}
									text="Gerar Nova Senha"
									type={ButtonType.Submit}
								/>
							</RadixForm.Submit>
							{isSubmitting && <YemSpinner />}
						</Form>
					</RadixForm.Form>
					<div className="m-3 w-[260px] mx-auto flex justify-center gap-1">
						<Link to="/login">
							<p className="text-center text-xs text-mauve-11 dark:text-mauvedark-10">
								Fazer login
							</p>
						</Link>
						<Separator
							className="bg-mauve-11 dark:bg-mauvedark-11 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-4 data-[orientation=vertical]:w-px"
							decorative
							orientation="vertical"
						/>
						<Link to="/register">
							<p className="text-center text-xs text-mauve-11 dark:text-mauvedark-10">
								Criar uma conta
							</p>
						</Link>
					</div>
				</div>
			</main>
		</>
	);
}
