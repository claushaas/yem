/** biome-ignore-all lint/style/noNonNullAssertion: . */
import type { LoaderFunctionArgs, MetaArgs } from 'react-router';

export const meta = ({ data }: MetaArgs<typeof loader>) => [
	{ title: 'Comentários - Yoga em Movimento' },
	{
		content: 'Comentários sobre os cursos oferecidos pela Yoga em Movimento',
		name: 'description',
	},
	{ content: 'noindex, nofollow', name: 'robots' },
	...data!.meta,
];

export const loader = ({ request }: LoaderFunctionArgs) => ({
	meta: [
		{
			href: new URL('/admin/comments', request.url).toString(),
			rel: 'canonical',
			tagName: 'link',
		},
	],
});

export default function Comments() {
	return (
		<div>
			<h1>Comments</h1>
		</div>
	);
}
