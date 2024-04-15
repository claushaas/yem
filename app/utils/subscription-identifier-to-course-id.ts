/* eslint-disable quote-props */
/* eslint-disable @typescript-eslint/naming-convention */

import {type TPlanIdentifier} from '~/types/subscription.type';

export const subscriptionIdentifierToCourseId = {
	escola_mensal: '750c5893-e395-411c-8438-1754e1fd0663',
	escola_online_plano_anual: 'c15efa5f-17f3-4db2-8e5a-b3cb287065d3',
	escola_anual_bf: 'c15efa5f-17f3-4db2-8e5a-b3cb287065d3',
	escola_trimestral_bf: 'c15efa5f-17f3-4db2-8e5a-b3cb287065d3',
	escola_semestral: 'c15efa5f-17f3-4db2-8e5a-b3cb287065d3',
	escola_anual: 'c15efa5f-17f3-4db2-8e5a-b3cb287065d3',
	escola_semestral_promocional: 'c15efa5f-17f3-4db2-8e5a-b3cb287065d3',
	escola_mensal_promocional: '750c5893-e395-411c-8438-1754e1fd0663',
	escola_anual_promocional: 'c15efa5f-17f3-4db2-8e5a-b3cb287065d3',
	'135340': '750c5893-e395-411c-8438-1754e1fd0663',
	'1392822': 'db66f261-f832-4f0b-9565-53d8f8422d51',
	'Mensal 77': '750c5893-e395-411c-8438-1754e1fd0663',
	'Mensal boleto': '750c5893-e395-411c-8438-1754e1fd0663',
	'Anual 497': 'c15efa5f-17f3-4db2-8e5a-b3cb287065d3',
	'Anual - boleto': 'c15efa5f-17f3-4db2-8e5a-b3cb287065d3',
};

export const convertSubscriptionIdentifierToCourseId = (subscriptionIdentifier: TPlanIdentifier): string => subscriptionIdentifierToCourseId[subscriptionIdentifier];
