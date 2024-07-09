import {json, type LoaderFunctionArgs} from '@remix-run/node';

export const meta = () => [
	{name: 'robots', content: 'noindex, nofollow'},
];

export const loader = async ({request}: LoaderFunctionArgs) => json({
	message: 'OK!',
});
