import {json, type LoaderFunctionArgs} from '@remix-run/node';

export const loader = async ({request}: LoaderFunctionArgs) => json({
	message: 'OK!',
});
