import * as RadixForm from '@radix-ui/react-form';
import {
	type ActionFunctionArgs, redirect,
	type LoaderFunctionArgs,
	json,
} from '@remix-run/node';
import {Form, type MetaFunction, useNavigation} from '@remix-run/react';
import {Button, ButtonPreset, ButtonType} from '~/components/button.js';
import {getUserSession, destroyUserSession} from '~/utils/session.server';
import {YemSpinner} from '~/components/yem-spinner.js';

export const meta: MetaFunction<typeof loader> = ({data}) => [
	{title: 'Yoga em Movimento - Sair'},
	{name: 'description', content: 'Faça o logout da plataforma do Yoga em Movimento.'},
	...data!.meta,
];

export const loader = ({request}: LoaderFunctionArgs) => json<{meta: Array<{tagName: string; rel: string; href: string}>}>({
	meta: [{tagName: 'link', rel: 'canonical', href: new URL('/logout', request.url).toString()}],
});

export const action = async ({request}: ActionFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));

	return redirect('/', {
		headers: {
			'Set-Cookie': await destroyUserSession(userSession), // eslint-disable-line @typescript-eslint/naming-convention
		},
	});
};

export default function Logout() {
	const navigation = useNavigation();
	const isSubmitting = navigation.formAction === '/logout';

	return (
		<main className='flex flex-col flex-grow-[0.6] mt-20'>
			<div className='w-[260px] mx-auto my-auto flex flex-col'>
				<p className='mb-3 text-center'>Ao clicar no botão abaixo você fará o logout da Plataforma da Yoga em Movimento</p>
				<RadixForm.Form asChild noValidate action='/logout' method='post' className='m-auto'>
					<Form>
						<RadixForm.Submit asChild>
							<Button isDisabled={isSubmitting} preset={ButtonPreset.Primary} type={ButtonType.Submit} text='Sair'/>
						</RadixForm.Submit>
						{isSubmitting && (
							<YemSpinner/>
						)}
					</Form>
				</RadixForm.Form>
			</div>
		</main>
	);
}
