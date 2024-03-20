import {Bars4Icon} from '@heroicons/react/24/outline';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import * as Separator from '@radix-ui/react-separator';
import {Link, useLoaderData} from '@remix-run/react';
import {NavLink} from '~/components/navBar/navLink';
import {type TypeUserSession} from '~/types/userSession.type';

export const NavBar = () => {
	const data = useLoaderData() as {userData?: TypeUserSession | undefined} ?? {};
	const userData = data?.userData;

	return (
		<header className='max-xs:max-w-[95%] max-w-[90%] mx-auto my-4 flex justify-between items-center w-[-webkit-fill-available]'>
			<div className='w-72'>
				<Link to={'/'}>
					<div className=' inline max-sm:before:bg-[url("./assets/logo/logo-reduzido-colorido.svg")] sm:before:bg-[url("./assets/logo/logo-retangular-colorido.svg")] max-xs:before:h-14 before:h-20 before:block before:bg-no-repeat'/>
				</Link>
			</div>
			<NavigationMenu.Root
				className='relative z-10 flex justify-center'
			>
				<NavigationMenu.List className='gap-3 center flex list-none items-center px-4 py-2 rounded-md shadow-sm shadow-mauve-11 dark:shadow-mauvedark-3 bg-mauve-4 dark:bg-mauvedark-3'>
					{
						!userData && (
							<>
								<NavigationMenu.Item>
									<div className='py-1.5 leading-none'>
										<NavLink to='/login'>
											<p>Login</p>
										</NavLink>
									</div>
								</NavigationMenu.Item>
								<Separator.Root
									className='bg-mauve-11 dark:bg-mauvedark-11 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-4 data-[orientation=vertical]:w-px'
									decorative
									orientation='vertical' />
							</>
						)
					}
					<NavigationMenu.Item>
						<NavigationMenu.Trigger className='center m-0 flex list-none py-1 leading-none'>
							<p className='mr-1'>Menu</p>
							<Bars4Icon
								className='size-4' />
						</NavigationMenu.Trigger>
						<NavigationMenu.Content className='data-[motion=from-start]:animate-enterFromLeft data-[motion=from-end]:animate-enterFromRight data-[motion=to-start]:animate-exitToLeft data-[motion=to-end]:animate-exitToRight px-4 py-2 bg-mauve-4 dark:bg-mauvedark-6 absolute top-0 right-0 rounded-md max-xs:w-[calc(100vw_-_calc(100vw_*_5_/_100))] w-72'>
							<ul className=''>
								{
									userData && (
										<li className='text-mauve-11 dark:text-mauvedark-11'>
											<NavLink to='/logout'>Sair</NavLink>
										</li>
									)
								}
								<li className='text-mauve-11 dark:text-mauvedark-11'>Item 2</li>
							</ul>
						</NavigationMenu.Content>
					</NavigationMenu.Item>

					<NavigationMenu.Indicator className='radix-state-visible:animate-fadeIn radix-state-hidden:animate-fadeOut top-full z-[1] flex h-[10px] items-end justify-center overflow-hidden transition-[width,transform_250ms_ease]'>
						<div className='relative top-[70%] h-[10px] w-[10px] rotate-[45deg] rounded-tl-[2px] bg-mauve-4 dark:bg-mauvedark-6' />
					</NavigationMenu.Indicator>
				</NavigationMenu.List>

				<div className='perspective-[2000px] absolute top-full right-0 flex justify-center max-xs:w-[calc(100vw_-_calc(100vw_*_5_/_100))] w-72'>
					<NavigationMenu.Viewport className='data-[state=open]:animate-scaleIn data-[state=closed]:animate-scaleOut relative mt-[10px] h-[var(--radix-navigation-menu-viewport-height)] origin-[top_center] overflow-hidden rounded-[6px] bg-white transition-[width,_height] duration-300 max-xs:w-[calc(100vw_-_calc(100vw_*_5_/_100))] w-72' />
				</div>
			</NavigationMenu.Root>
		</header>
	);
};