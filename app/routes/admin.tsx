import {
	Link, Outlet, useNavigate, useOutletContext,
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
		<div className='flex max-w-[95%] w-full mx-auto flex-col sm:flex-row gap-4'>
			<aside className='w-64 p-3 bg-mauve-3 dark:bg-mauvedark-3 shadow-sm shadow-mauve-11 dark:shadow-mauvedark-3 rounded-lg h-fit'>
				<Link to='/admin/courses'>
					<p>Cursos</p>
				</Link>
			</aside>
			<main className='flex-grow flex-shrink p-3'>
				<Outlet/>
			</main>
		</div>
	);
}
