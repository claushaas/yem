import {Separator} from '@radix-ui/react-separator';
import {Link} from '@remix-run/react';

export const Footer = () => (
	<footer className='mt-20 mb-10 max-w-[90%] mx-auto w-full flex justify-center flex-col items-center'>
		<Separator
			className='bg-mauve-11 dark:bg-mauvedark-11 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full mb-10'
			decorative
			orientation='horizontal'
		/>
		<div className='max-w-screen-md flex flex-col justify-center gap-4 items-center'>
			<div className='w-40'>
				<div className=' inline before:bg-[url("./assets/logo/logo-quadrado-colorido.svg")] before:h-40 before:block before:bg-no-repeat'/>
			</div>
			<div className='flex justify-center gap-4 items-center'>
				<Link to='/termos-de-privacidade'>
					<p className='text-center'>Termos de Privacidade</p>
				</Link>
				<Separator
					className='bg-mauve-11 dark:bg-mauvedark-11 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-4 data-[orientation=vertical]:w-px'
					decorative
					orientation='vertical'
				/>
				<Link to='/termos-de-uso'>
					<p className='text-center'>Termos de Uso</p>
				</Link>
			</div>
			<div>
				<p className='text-center'>Todos os direiros reservados - 2024 - Yoga em Movimento Ltda - CNPJ 12.772.498/0001-90 - Rua Miguel Ferragut, 140, BL E AP 2, Vinhedo, SP, Brasil, CEP 13289-448</p>
			</div>
		</div>
	</footer>
);
