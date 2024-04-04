import {json, redirect, type LoaderFunctionArgs} from '@remix-run/node';
import {useLoaderData} from '@remix-run/react';
import {UserService} from '~/services/user.service';
import {type TUser} from '~/types/user.type';
import {commitUserSession, getUserSession} from '~/utils/session.server';

type StudentLoaderData = {
	studentData: TUser | undefined;
};

export const loader = async ({request, params}: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));
	const {username} = params;

	try {
		const {data: studentData} = await new UserService().getUserData(username!);

		return json<StudentLoaderData>({studentData}, {
			headers: {
				'Set-Cookie': await commitUserSession(userSession), // eslint-disable-line @typescript-eslint/naming-convention
			},
		});
	} catch {
		userSession.flash('error', `Erro ao buscar dados do aluno ${username}`);

		return redirect('/admin/students', {
			headers: {
				'Set-Cookie': await commitUserSession(userSession), // eslint-disable-line @typescript-eslint/naming-convention
			},
		});
	}
};

export default function Student() {
	const {studentData} = useLoaderData<StudentLoaderData>();
	return studentData && (
		<>
			<h1>{`${studentData.firstName} ${studentData.lastName}`}</h1>
			<h3>{studentData.email}</h3>
			<h3>{studentData.phoneNumber}</h3>
			{/* eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing */}
			<h3>{studentData.document || 'Pedir para cadastrar CPF'}</h3>
		</>
	);
}
