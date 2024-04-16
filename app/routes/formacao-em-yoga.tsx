import {type LoaderFunctionArgs, json} from '@remix-run/node';
import {type MetaFunction} from '@remix-run/react';

export const meta: MetaFunction<typeof loader> = ({data}) => [
	{title: 'Formação em Yoga - Yoga em Movimento'},
	{name: 'description', content: 'O curso de Formação em Yoga mais abrangente do Brasil. Com aulas práticas e teóricas, você se tornará um professor de Yoga completo.'},
	...data!.meta,
];

export const loader = ({request}: LoaderFunctionArgs) => json<{meta: Array<{tagName: string; rel: string; href: string}>}>({
	meta: [{tagName: 'link', rel: 'canonical', href: new URL('/formacao-em-yoga', request.url).toString()}],
});

export default function Formacao() {
	return (
		<main>
			<h1>Formação</h1>
		</main>
	);
}
