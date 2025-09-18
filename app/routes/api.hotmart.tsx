import type { LoaderFunctionArgs } from 'react-router';
import { HooksService } from '~/services/hooks.service.server';
import type { TIncommingHotmartWebhook } from '~/types/subscription.type';
import {
	getCountryCode,
	type TCountriesIsos,
} from '~/utils/countries-area-codes.js';
import { logger } from '~/utils/logger.util';

export const meta = () => [{ content: 'noindex, nofollow', name: 'robots' }];

export const loader = async () => {
	try {
		return Response.json(
			{
				message: 'OK',
			},
			{
				status: 200,
			},
		);
	} catch (error) {
		logger.logError(
			`Error sending message on hotmart loader: ${(error as Error).message}`,
		);
		return { error: 'An error occurred' };
	}
};

export const action = async ({ request }: LoaderFunctionArgs) => {
	try {
		const { headers } = request;
		const HOTMART_HOTTOK = headers.get('X-HOTMART-HOTTOK');

		if (HOTMART_HOTTOK === process.env.HOTMART_HOTTOK) {
			const body = (await request.json()) as TIncommingHotmartWebhook;
			const phoneNumberWithoutCountryCode = body.data.buyer.checkout_phone;
			const countryIso = body.data.purchase.checkout_country.iso;
			const completePhoneNumber = `+${getCountryCode(countryIso as TCountriesIsos)}${phoneNumberWithoutCountryCode}`;
			await new HooksService().handleHotmartWebhook({
				...body,
				data: {
					...body.data,
					buyer: {
						...body.data.buyer,
						checkout_phone: completePhoneNumber,
					},
				},
			});

			return Response.json(
				{
					message: 'OK',
				},
				{
					status: 200,
				},
			);
		}

		return Response.json(
			{
				message: 'Unauthorized',
			},
			{
				status: 401,
			},
		);
	} catch (error) {
		logger.logError(
			`Error sending message on hotmart action: ${(error as Error).message}`,
		);
		return { error: 'An error occurred' };
	}
};
