import {type LoaderFunctionArgs} from '@remix-run/node';
import {json, type MetaFunction} from '@remix-run/react';

export const meta: MetaFunction<typeof loader> = ({data}) => [
	{title: 'Escola Online - Yoga em Movimento'},
	{name: 'description', content: 'A maior escola de Yoga online do Brasil. Com mais de 1500 aulas disponíveis para você praticar onde e quando quiser.'},
	...data!.meta,
];

export const loader = ({request}: LoaderFunctionArgs) => json<{meta: Array<{tagName: string; rel: string; href: string}>}>({
	meta: [{tagName: 'link', rel: 'canonical', href: new URL('/escola-online', request.url).toString()}],
});

export default function EscolaOnline() {
	return (
		<main>
			<h1>Escola Online</h1>
		</main>
	);
}
