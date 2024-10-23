/* eslint-disable @typescript-eslint/naming-convention */
import * as RadixForm from '@radix-ui/react-form';
import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	data,
} from '@remix-run/node';
import {
	Form,
	type MetaArgs,
	redirect,
	useLoaderData,
	useNavigation,
} from '@remix-run/react';
import {Button, ButtonPreset, ButtonType} from '~/components/button.js';
import {getUserSession, destroyUserSession} from '~/utils/session.server';
import {YemSpinner} from '~/components/yem-spinner.js';
import {type TypeUserSession} from '~/types/user-session.type';
import {NavigateBar} from '~/components/navigation-bar.js';

export const meta = ({data}: MetaArgs<typeof loader>) => [
	{title: 'Yoga em Movimento - Sair'},
	{name: 'description', content: 'Faça o logout da plataforma do Yoga em Movimento.'},
	...(data! as {
		meta: Array<{
			tagName: string;
			rel: string;
			href: string;
		}>;
		userData: TypeUserSession;
	}).meta,
];

export const loader = async ({request}: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));

	if (!userSession.data.id) {
		return redirect('/');
	}

	return {
		meta: [{tagName: 'link', rel: 'canonical', href: new URL('/logout', request.url).toString()}],
		userData: userSession.data as TypeUserSession,
	};
};

export const action = async ({request}: ActionFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));

	return data({}, {headers: {'Set-Cookie': await destroyUserSession(userSession)}});
};

export default function Logout() {
	const navigation = useNavigation();
	const isSubmitting = navigation.formAction === '/logout';
	const {userData} = useLoaderData<typeof loader>() as {
		meta: Array<{
			tagName: string;
			rel: string;
			href: string;
		}>;
		userData: TypeUserSession;
	};

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
