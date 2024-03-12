import type {MetaFunction} from '@remix-run/node';
import React from 'react';

export const meta: MetaFunction = () => [
	{title: 'New Remix App'},
	{name: 'description', content: 'Welcome to Remix!'},
];

const Index = () => (
	<div>
		<h1>Welcome to Remix</h1>
		<ul>
			<li>
				<a
					target='_blank'
					href='https://remix.run/tutorials/blog'
					rel='noreferrer'
				>
					<p>15m Quickstart Blog Tutorial</p>
				</a>
			</li>
			<li>
				<a
					target='_blank'
					href='https://remix.run/tutorials/jokes'
					rel='noreferrer'
				>
            Deep Dive Jokes App Tutorial
				</a>
			</li>
			<li>
				<a target='_blank' href='https://remix.run/docs' rel='noreferrer'>
            Remix Docs
				</a>
			</li>
		</ul>
	</div>
);

export default Index;
