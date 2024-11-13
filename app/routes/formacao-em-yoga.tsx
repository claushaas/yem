import {type LoaderFunctionArgs} from '@remix-run/node';
import {Link, type MetaFunction} from '@remix-run/react';
import {Button, ButtonPreset, ButtonType} from '~/components/button.js';

export const meta: MetaFunction<typeof loader> = ({data}) => [
	{title: 'Formação em Yoga - Yoga em Movimento'},
	{name: 'description', content: 'O curso de Formação em Yoga mais abrangente do Brasil. Com aulas práticas e teóricas, você se tornará um professor de Yoga completo.'},
	...data!.meta,
];

export const loader = ({request}: LoaderFunctionArgs) => ({
	meta: [{tagName: 'link', rel: 'canonical', href: new URL('/formacao-em-yoga', request.url).toString()}],
});

export default function Formacao() {
	return (
		<>
			<header className='max-xs:max-w-[95%] max-w-[90%] mx-auto my-4 flex justify-between items-center w-[-webkit-fill-available]'>
				<div className='w-72'>
					<div aria-label='Página inicial do Yoga em Movimento' className='inline before:bg-[url("./assets/logo/logo-reduzido-colorido.svg")] sm:before:bg-[url("./assets/logo/logo-retangular-colorido.svg")] max-xs:before:h-14 before:h-20 before:block before:bg-no-repeat'/>
				</div>
				<div className='flex gap-4 flex-wrap justify-end'>
					<Link to='/login' aria-label='Entrar na plataforma do Yoga em Movimento'>
						<Button type={ButtonType.Button} preset={ButtonPreset.Secondary} text='Entrar'/>
					</Link>
					<Button type={ButtonType.Button} preset={ButtonPreset.Primary} text='Começar Agora'/>
				</div>
			</header>
			<main>
				<h1>Formação</h1>
			</main>
		</>
	);
}
