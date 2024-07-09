import * as RadixForm from '@radix-ui/react-form';
import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	unstable_defineAction as defineAction,
	unstable_defineLoader as defineLoader,
} from '@remix-run/node';
import {
	Form,
	type MetaArgs_SingleFetch,
	useLoaderData,
	useNavigation,
} from '@remix-run/react';
import {Button, ButtonPreset, ButtonType} from '~/components/button.js';
import {getUserSession, destroyUserSession} from '~/utils/session.server';
import {YemSpinner} from '~/components/yem-spinner.js';
import {type TypeUserSession} from '~/types/user-session.type';
import {NavigateBar} from '~/components/navigation-bar.js';

export const meta = ({data}: MetaArgs_SingleFetch<typeof loader>) => [
	{title: 'Yoga em Movimento - Sair'},
	{name: 'description', content: 'Faça o logout da plataforma do Yoga em Movimento.'},
	...data!.meta,
];

export const loader = defineLoader(async ({request}: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));

	return {
		meta: [{tagName: 'link', rel: 'canonical', href: new URL('/logout', request.url).toString()}],
		userData: userSession.data as TypeUserSession,
	};
});

export const action = defineAction(async ({request, response}: ActionFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));

	response?.headers.set('Set-Cookie', await destroyUserSession(userSession));
	response?.headers.set('Location', '/');

	return null;
});

export default function Logout() {
	const navigation = useNavigation();
	const isSubmitting = navigation.formAction === '/logout';
	const {userData} = useLoaderData<typeof loader>();

	return (
		<>
			<NavigateBar userData={userData}/>

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
		</>
	);
}
