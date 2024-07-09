import {type LoaderFunctionArgs, unstable_defineLoader as defineLoader} from '@remix-run/node';
import {type MetaArgs_SingleFetch} from '@remix-run/react';

export const meta = ({data}: MetaArgs_SingleFetch<typeof loader>) => [
	{title: 'Comentários - Yoga em Movimento'},
	{name: 'description', content: 'Comentários sobre os cursos oferecidos pela Yoga em Movimento'},
	{name: 'robots', content: 'noindex, nofollow'},
	...data!.meta,
];

export const loader = defineLoader(({request}: LoaderFunctionArgs) => ({
	meta: [{tagName: 'link', rel: 'canonical', href: new URL('/admin/comments', request.url).toString()}],
}));

export default function Comments() {
	return (
		<main>
			<h1>Comments</h1>
		</main>
	);
}
