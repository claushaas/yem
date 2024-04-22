/* eslint-disable quote-props */
/* eslint-disable @typescript-eslint/naming-convention */

import {type TPlanIdentifier} from '~/types/subscription.type';

export const subscriptionIdentifierToCourseId = {
	escola_mensal: 'escola-online',
	escola_online_plano_anual: 'yoga-e-hinduismo',
	escola_anual_bf: 'yoga-e-hinduismo',
	escola_trimestral_bf: 'yoga-e-hinduismo',
	escola_semestral: 'yoga-e-hinduismo',
	escola_anual: 'yoga-e-hinduismo',
	escola_semestral_promocional: 'yoga-e-hinduismo',
	escola_mensal_promocional: 'escola-online',
	escola_anual_promocional: 'yoga-e-hinduismo',
	'135340': 'escola-online',
	'1392822': 'db66f261-f832-4f0b-9565-53d8f8422d51',
	'Mensal 77': 'escola-online',
	'Mensal boleto': 'escola-online',
	'Anual 497': 'yoga-e-hinduismo',
	'Anual - boleto': 'yoga-e-hinduismo',
	beginner: 'yoga-para-iniciantes',
};

export const convertSubscriptionIdentifierToCourseId = (subscriptionIdentifier: TPlanIdentifier): string => subscriptionIdentifierToCourseId[subscriptionIdentifier];
