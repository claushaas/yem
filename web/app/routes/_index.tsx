import type {MetaFunction} from '@remix-run/node';
import React from 'react';

export const meta: MetaFunction = () => [
	{title: 'New Remix App'},
	{name: 'description', content: 'Welcome to Remix!'},
];

const Index = () => (
	<>
		<h1>Página Inicial</h1>
	</>
);

export default Index;
