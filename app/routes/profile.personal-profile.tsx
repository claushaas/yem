import { type LoaderFunctionArgs, useLoaderData } from 'react-router';
import { type TypeUserSession } from '~/types/user-session.type';
import { getUserSession } from '~/utils/session.server';

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));
	const userData = userSession.data as TypeUserSession;

	return {
		meta: [
			{
				href: new URL('/profile/completed-lessons', request.url).toString(),
				rel: 'canonical',
				tagName: 'link',
			},
		],
		userData,
	};
};

export default function PersonalProfile() {
	const { userData } = useLoaderData<typeof loader>();

	return (
		<>
			<div>
				<h1>Nome</h1>
				<h4>{`${userData.firstName} ${userData.lastName}`}</h4>
			</div>
			<div className="mt-7">
				<h1>Telefone / WhatsApp</h1>
				<h4>{userData.phoneNumber}</h4>
			</div>
			<div className="mt-7">
				<h1>Email</h1>
				<h4>{userData.email}</h4>
			</div>
		</>
	);
}
