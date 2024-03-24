import * as RadixForm from '@radix-ui/react-form';
import {
	type ActionFunctionArgs, redirect,
} from '@remix-run/node';
import {Form, useNavigation} from '@remix-run/react';
import {Button, ButtonPreset, ButtonType} from '~/components/button/index.js';
import {getUserSession, destroyUserSession} from '~/utils/session.server';
import {YemSpinner} from '~/components/yemSpinner/index.js';

export const action = async ({request}: ActionFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));

	return redirect('/', {
		headers: {
			'Set-Cookie': await destroyUserSession(userSession), // eslint-disable-line @typescript-eslint/naming-convention
		},
	});
};

function Logout() {
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

export default Logout;
