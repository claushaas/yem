import React from 'react';
import * as RadixForm from '@radix-ui/react-form';
import {Button, ButtonPreset, ButtonType} from '~/components/button';
import {
	json, type ActionFunctionArgs, type LoaderFunctionArgs, redirect,
} from '@remix-run/node';
import {Form} from '@remix-run/react';
import {getUserSession, destroyUserSession} from '~/utils/session.server';
import {yemApiRequest} from '~/utils/request.server';

export const action = async ({request}: ActionFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));

	await yemApiRequest.get('/users/logout');

	return redirect('/', {
		headers: {
			'Set-Cookie': await destroyUserSession(userSession),
		},
	});
};

const Logout = () => (
	<main className='flex flex-col flex-grow-[0.6]'>
		<div className='w-[260px] mx-auto my-auto flex flex-col'>
			<p className='mb-3 text-center'>Ao clicar no botão abaixo você fará o logout da Plataforma da Yoga em Movimento</p>
			<RadixForm.Form	asChild method='post' noValidate className='m-auto'>
				<Form>
					<Button preset={ButtonPreset.Primary} type={ButtonType.Submit} text='Sair' />
				</Form>
			</RadixForm.Form>
		</div>
	</main>
);

export default Logout;
