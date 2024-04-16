import {json, type LoaderFunctionArgs} from '@remix-run/node';
import {type MetaFunction} from '@remix-run/react';

export const meta: MetaFunction = () => [
	{name: 'robots', content: 'noindex, nofollow'},
];

export const loader = async ({request}: LoaderFunctionArgs) => json({
	message: 'OK!',
});
