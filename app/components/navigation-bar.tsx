import { Bars4Icon } from '@heroicons/react/24/outline';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import * as Separator from '@radix-ui/react-separator';
import { AnimatePresence, motion } from 'motion/react';
import { Link, useLocation } from 'react-router';
import { type TypeUserSession } from '~/types/user-session.type';

type NavigateLinkProprierties = {
	readonly to: string;
	readonly children?: React.ReactNode;
};

function NavigateLink({
	to,
	children,
	...properties
}: NavigateLinkProprierties) {
	const location = useLocation();
	const isActive = location.pathname === to;

	return (
		<NavigationMenu.Link active={isActive} asChild>
			<Link to={to} {...properties}>
				<li className="text-mauve-11 dark:text-mauvedark-11 bg-mauve-4 dark:bg-mauvedark-4 hover:bg-mauve-5 dark:hover:bg-mauvedark-5 rounded-lg p-3 shadow-xs shadow-mauve-11 dark:shadow-mauvedark-3">
					{children}
				</li>
			</Link>
		</NavigationMenu.Link>
	);
}

export function NavigateBar({
	userData,
}: {
	readonly userData: TypeUserSession | undefined;
}) {
	const { pathname } = useLocation();

	return (
		<header className="max-xs:max-w-[95%] max-w-[90%] mx-auto my-4 flex justify-between items-center w-[-webkit-fill-available]">
			<div className="w-72">
				<Link aria-label="Página inicial do Yoga em Movimento" to="/">
					<div
						aria-label="Página inicial do Yoga em Movimento"
						className='inline before:bg-[url("./assets/logo/logo-reduzido-colorido.svg")] sm:before:bg-[url("./assets/logo/logo-retangular-colorido.svg")] max-xs:before:h-14 before:h-20 before:block before:bg-no-repeat'
					/>
					<p className="hidden">Home</p>
				</Link>
			</div>
			<NavigationMenu.Root className="relative flex justify-center">
				<NavigationMenu.List className="gap-3 center flex list-none items-center px-4 py-2 rounded-md shadow-xs shadow-mauve-11 dark:shadow-mauvedark-3 bg-mauve-4 dark:bg-mauvedark-3">
					{!userData?.id && pathname !== '/login' && (
						<>
							<NavigationMenu.Item>
								<div className="py-1.5 leading-none">
									<NavigationMenu.Link asChild>
										<Link to="/login">
											<p>Entrar</p>
										</Link>
									</NavigationMenu.Link>
								</div>
							</NavigationMenu.Item>
							<Separator.Root
								className="bg-mauve-11 dark:bg-mauvedark-11 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-4 data-[orientation=vertical]:w-px"
								decorative
								orientation="vertical"
							/>
						</>
					)}

					<NavigationMenu.Item>
						<NavigationMenu.Trigger className="center m-0 flex list-none py-1 leading-none cursor-pointer">
							<p className="mr-1">Menu</p>
							<Bars4Icon className="size-4" />
						</NavigationMenu.Trigger>

						<AnimatePresence>
							<NavigationMenu.Content asChild>
								<motion.div
									animate={{ opacity: 1, scale: 1 }}
									className="px-4 py-2 bg-mauve-3 dark:bg-mauvedark-3 absolute top-0 right-0 rounded-md max-xs:w-[calc(100vw_-_calc(100vw_*_5_/_100))] w-72"
									initial={{ opacity: 0, scale: 0 }}
								>
									<ul className="grid grid-cols-2 gap-3">
										{pathname !== '/' && (
											<NavigateLink to="/">Home</NavigateLink>
										)}
										{userData?.roles?.includes('admin') &&
											!pathname.startsWith('/admin') && (
												<NavigateLink to="/admin">Admin</NavigateLink>
											)}
										{pathname !== '/courses' && (
											<NavigateLink to="/courses">Cursos</NavigateLink>
										)}
										{!pathname.startsWith('/profile') && userData?.id && (
											<NavigateLink to="/profile">Minha Área</NavigateLink>
										)}
										{userData?.id && pathname !== '/logout' && (
											<NavigateLink to="/logout">Sair</NavigateLink>
										)}
									</ul>
								</motion.div>
							</NavigationMenu.Content>
						</AnimatePresence>
					</NavigationMenu.Item>

					<NavigationMenu.Indicator className="radix-state-visible:animate-fadeIn radix-state-hidden:animate-fadeOut top-full z-1 flex h-[10px] items-end justify-center overflow-hidden transition-[width,transform_250ms_ease]">
						<div className="relative top-[70%] h-[10px] w-[10px] rotate-[45deg] rounded-tl-[2px] bg-mauve-4 dark:bg-mauvedark-6" />
					</NavigationMenu.Indicator>
				</NavigationMenu.List>

				<div className="perspective-[2000px] absolute top-full right-0 flex justify-center max-xs:w-[calc(100vw_-_calc(100vw_*_5_/_100))] w-72">
					<NavigationMenu.Viewport className="data-[state=open]:animate-scaleIn data-[state=closed]:animate-scaleOut relative mt-[10px] h-[var(--radix-navigation-menu-viewport-height)] origin-[top_center] overflow-hidden rounded-[6px] bg-white transition-[width,_height] duration-300 max-xs:w-[calc(100vw_-_calc(100vw_*_5_/_100))] w-72" />
				</div>
			</NavigationMenu.Root>
		</header>
	);
}
