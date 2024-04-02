import {type MetaFunction} from '@remix-run/react';

export const meta: MetaFunction = () => [
	{title: 'Yoga em Movimento - Escola Online'},
	{name: 'description', content: 'A maior escola de Yoga online do Brasil. Com mais de 1500 aulas disponíveis para você praticar onde e quando quiser.'},
];

export default function EscolaOnline() {
	return (
		<main>
			<h1>Escola Online</h1>
		</main>
	);
}
