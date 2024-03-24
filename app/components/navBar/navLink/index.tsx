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
				{children}
			</Link>
		</NavigationMenu.Link>
	);
}
