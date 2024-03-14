import React from 'react';
import * as RadixForm from '@radix-ui/react-form';
import {Button, ButtonPreset, ButtonType} from '~/components/button';
import {
	json, type ActionFunctionArgs, type LoaderFunctionArgs, redirect,
} from '@remix-run/node';
import {Form, useLoaderData} from '@remix-run/react';
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
	<>
		<p>Ao clicar no botão abaixo você fará o logout da Plataforma da Yoga em Movimento</p>
		<RadixForm.Form	asChild method='post' noValidate>
			<Form>
				<Button preset={ButtonPreset.Primary} type={ButtonType.Submit} text='Sair' />
			</Form>
		</RadixForm.Form>
	</>
);

export default Logout;
