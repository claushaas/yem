import {
	useNavigate, useOutletContext,
} from '@remix-run/react';
import {useEffect} from 'react';
import {type TypeUserSession} from '~/types/user-session.type';

export default function Admin() {
	const {userData} = useOutletContext<{userData: TypeUserSession}>();
	const navigate = useNavigate();

	useEffect(() => {
		if (!userData?.roles.includes('admin')) {
			navigate('/');
		}
	}, [userData?.roles, navigate]);

	return userData?.roles.includes('admin') && (
		<div className='flex max-w-[95%] w-full mx-auto flex-col sm:flex-row'>
			<aside className='w-64 p-3'>
				Menu admin
			</aside>
			<main className='flex-grow flex-shrink p-3'>
				<h1>Admin</h1>
			</main>
		</div>
	);
}
