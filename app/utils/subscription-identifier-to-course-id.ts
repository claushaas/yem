/* eslint-disable quote-props */
/* eslint-disable @typescript-eslint/naming-convention */

import {type TPlanIdentifier} from '~/types/subscription.type';

export const subscriptionIdentifierToCourseSlug = {
	escola_mensal: 'escola-online',
	escola_online_plano_anual: 'cursos-de-aprofundamento',
	escola_anual_bf: 'cursos-de-aprofundamento',
	escola_trimestral_bf: 'cursos-de-aprofundamento',
	escola_semestral: 'cursos-de-aprofundamento',
	escola_anual: 'cursos-de-aprofundamento',
	escola_semestral_promocional: 'cursos-de-aprofundamento',
	escola_mensal_promocional: 'escola-online',
	escola_anual_promocional: 'cursos-de-aprofundamento',
	'135340': 'escola-online',
	'1392822': 'formacao-em-yoga',
	'Mensal 77': 'escola-online',
	'Mensal boleto': 'escola-online',
	'Anual 497': 'cursos-de-aprofundamento',
	'Anual - boleto': 'cursos-de-aprofundamento',
	beginner: 'yoga-para-iniciantes',
	Mensal: 'escola-online',
	Anual: 'cursos-de-aprofundamento',
	oldFormation: 'formacao-de-instrutores',
};

export const convertSubscriptionIdentifierToCourseSlug = (subscriptionIdentifier: TPlanIdentifier): string => subscriptionIdentifierToCourseSlug[subscriptionIdentifier];
