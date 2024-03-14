import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import {Link, useLocation} from '@remix-run/react';
import React from 'react';

type NavLinkProps = {
	to: string;
	children?: React.ReactNode;
};

export const NavLink = ({to, children, ...props}: NavLinkProps) => {
	const location = useLocation();
	const isActive = location.pathname === to;

	return (
		<NavigationMenu.Link asChild active={isActive}>
			<Link to={to} {...props}>
				{children}
			</Link>
		</NavigationMenu.Link>
	);
};
