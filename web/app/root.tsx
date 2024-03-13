import {
	Link,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLocation,
} from '@remix-run/react';
import React from 'react';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import {
	Bars4Icon,
	MoonIcon,
} from '@heroicons/react/24/outline';
import {type LinksFunction} from '@remix-run/node';
import styles from '~/tailwind.css?url';

type NavLinkProps = {
	to: string;
	children?: React.ReactNode;
};

const NavLink = ({to, children, ...props}: NavLinkProps) => {
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

export const links: LinksFunction = () => [
	{rel: 'stylesheet', href: styles},
];

export function Layout({children}: {children: React.ReactNode}) {
	return (
		<html lang='en'>
			<head>
				<meta charSet='utf-8' />
				<meta name='viewport' content='width=device-width, initial-scale=1' />
				<Meta />
				<Links />
			</head>
			<body className='bg-mauve-2 dark:bg-mauvedark-2 min-h-screen'>
				<header className={`
					max-xs:max-w-[95%]
					max-w-[90%]
					mx-auto
					my-4
					flex
					justify-between
					items-center
				`}>
					<div className='w-40'>
						<Link to={'/'}>
							<div className='
							inline
							max-xs:before:bg-[url("./assets/logo/logo-reduzido-colorido.svg")]
							xs:before:bg-[url("./assets/logo/logo-retangular-colorido.svg")]
							before:h-10
							before:block
							before:bg-no-repeat
						'/>
						</Link>
					</div>
					<NavigationMenu.Root
						className='relative z-10 flex justify-center'
					>
						<NavigationMenu.List className='center flex list-none items-center px-4 py-2 rounded-md shadow-md shadow-mauve-11 dark:shadow-mauvedark-5 bg-mauve-4 dark:bg-mauvedark-3'>
							<NavigationMenu.Item>
								<div className='px-2 py-1.5 leading-none'>
									<MoonIcon
										className='block size-4'
									/>
								</div>
							</NavigationMenu.Item>
							<NavigationMenu.Item>
								<NavigationMenu.Trigger className='center m-0 flex list-none p-1 leading-none'>
									<p className='mr-1'>Menu</p>
									<Bars4Icon
										className='block size-4'
									/>
								</NavigationMenu.Trigger>
								<NavigationMenu.Content className='radix-state-open:animate-enterFromRight radix-state-closed:animate-exitToRight px-4 py-2 bg-mauve-4 dark:bg-mauvedark-6 absolute top-[54px] right-0 rounded-md max-xs:w-[calc(100vw_-_calc(100vw_*_5_/_100))] w-72'>
									<ul className=''>
										<li className='text-mauve-11 dark:text-mauvedark-11'>Item 1</li>
										<li className='text-mauve-11 dark:text-mauvedark-11'>Item 2</li>
									</ul>
								</NavigationMenu.Content>
							</NavigationMenu.Item>

							<NavigationMenu.Indicator className='radix-state-visible:animate-fadeIn radix-state-hidden:animate-fadeOut top-full z-[1] flex h-[10px] items-end justify-center overflow-hidden transition-[width,transform_250ms_ease]'>
								<div className='relative top-[70%] h-[10px] w-[10px] rotate-[45deg] rounded-tl-[2px] bg-mauve-4 dark:bg-mauvedark-6' />
							</NavigationMenu.Indicator>
						</NavigationMenu.List>
					</NavigationMenu.Root>
				</header>
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	return <Outlet />;
}
