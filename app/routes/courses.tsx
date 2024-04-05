import {type MetaFunction} from '@remix-run/react';

export const meta: MetaFunction = () => [
	{title: 'Yoga em Movimento - Cursos'},
	{name: 'description', content: 'Conheça e acesse todos cursos disponíveis na plataforma do Yoga em Movimento.'},
];

export default function Courses() {
	return (
		<main>
			<h1>Lista de cursos aqui</h1>
		</main>
	);
}
