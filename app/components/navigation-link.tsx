import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import {Link, useLocation} from '@remix-run/react';

type NavigateLinkProprierties = {
	readonly to: string;
	readonly children?: React.ReactNode;
};

export function NavigateLink({to, children, ...properties}: NavigateLinkProprierties) {
	const location = useLocation();
	const isActive = location.pathname === to;

	return (
		<NavigationMenu.Link asChild active={isActive}>
			<Link to={to} {...properties}>
				<li className='text-mauve-11 dark:text-mauvedark-11 bg-mauve-4 dark:bg-mauvedark-4 hover:bg-mauve-5 hover:dark:bg-mauvedark-5 rounded-lg p-3 shadow-sm shadow-mauve-11 dark:shadow-mauvedark-3'>
					{children}
				</li>
			</Link>
		</NavigationMenu.Link>
	);
}
