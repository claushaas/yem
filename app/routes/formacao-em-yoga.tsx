import {type MetaFunction} from '@remix-run/react';

export const meta: MetaFunction = () => [
	{title: 'Yoga em Movimento - Formação em Yoga'},
	{name: 'description', content: 'O curso de Formação em Yoga mais abrangente do Brasil. Com aulas práticas e teóricas, você se tornará um professor de Yoga completo.'},
];

export default function Formacao() {
	return (
		<main>
			<h1>Formação</h1>
		</main>
	);
}
