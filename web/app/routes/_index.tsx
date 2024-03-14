import type {MetaFunction} from '@remix-run/node';
import React from 'react';

export const meta: MetaFunction = () => [
	{title: 'Yoga em Movimento'},
	{name: 'description', content: 'Seja muito bem-vindo à Yoga em Movimento!'},
];

const Index = () => (
	<>
		<h1>Página Inicial</h1>
	</>
);

export default Index;
