/* eslint-disable quote-props */
/* eslint-disable @typescript-eslint/naming-convention */

import {type TPlanIdentifier} from '~/types/subscription.type';

export const subscriptionIdentifierToCourseId = {
	escola_mensal: '750c5893-e395-411c-8438-1754e1fd0663',
	escola_online_plano_anual: '750c5893-e395-411c-8438-1754e1fd0663',
	escola_anual_bf: '750c5893-e395-411c-8438-1754e1fd0663',
	escola_trimestral_bf: '750c5893-e395-411c-8438-1754e1fd0663',
	escola_semestral: '750c5893-e395-411c-8438-1754e1fd0663',
	escola_anual: '750c5893-e395-411c-8438-1754e1fd0663',
	escola_semestral_promocional: '750c5893-e395-411c-8438-1754e1fd0663',
	escola_mensal_promocional: '750c5893-e395-411c-8438-1754e1fd0663',
	escola_anual_promocional: '750c5893-e395-411c-8438-1754e1fd0663',
	'135340': '750c5893-e395-411c-8438-1754e1fd0663',
	'1392822': 'db66f261-f832-4f0b-9565-53d8f8422d51',
};

export const convertSubscriptionIdentifierToCourseId = (subscriptionIdentifier: TPlanIdentifier): string => subscriptionIdentifierToCourseId[subscriptionIdentifier];
