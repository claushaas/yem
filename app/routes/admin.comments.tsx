import {type LoaderFunctionArgs, type MetaArgs} from 'react-router';

export const meta = ({data}: MetaArgs<typeof loader>) => [
	{title: 'Comentários - Yoga em Movimento'},
	{name: 'description', content: 'Comentários sobre os cursos oferecidos pela Yoga em Movimento'},
	{name: 'robots', content: 'noindex, nofollow'},
	...data!.meta,
];

export const loader = ({request}: LoaderFunctionArgs) => ({
	meta: [{tagName: 'link', rel: 'canonical', href: new URL('/admin/comments', request.url).toString()}],
});

export default function Comments() {
	return (
		<div>
			<h1>Comments</h1>
		</div>
	);
}
