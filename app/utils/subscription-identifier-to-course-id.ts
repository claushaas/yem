/* eslint-disable quote-props */
/* eslint-disable @typescript-eslint/naming-convention */

import type { TPlanIdentifier } from '~/types/subscription.type';

export const subscriptionIdentifierToCourseSlug = {
	'135340': 'escola-online',
	'1392822': 'formacao-em-yoga-introducao',
	'4735693': 'formacao-em-yoga-introducao',
	Anual: 'cursos-de-aprofundamento',
	'Anual - boleto': 'cursos-de-aprofundamento',
	'Anual 497': 'cursos-de-aprofundamento',
	beginner: 'yoga-para-iniciantes',
	escola_anual: 'cursos-de-aprofundamento',
	escola_anual_bf: 'cursos-de-aprofundamento',
	escola_anual_promocional: 'cursos-de-aprofundamento',
	escola_mensal: 'escola-online',
	escola_mensal_promocional: 'escola-online',
	escola_online_plano_anual: 'cursos-de-aprofundamento',
	escola_semestral: 'cursos-de-aprofundamento',
	escola_semestral_promocional: 'cursos-de-aprofundamento',
	escola_trimestral_bf: 'cursos-de-aprofundamento',
	Mensal: 'escola-online',
	'Mensal 77': 'escola-online',
	'Mensal boleto': 'escola-online',
	novaFormacao: 'formacao-em-yoga-introducao',
	oldFormation: 'formacao-de-instrutores',
	vinyasa: 'especializacao-em-vinyasa-yoga',
	ypg: 'formacao-em-yoga-para-gestantes',
};

export const convertSubscriptionIdentifierToCourseSlug = (
	subscriptionIdentifier: TPlanIdentifier,
): string => subscriptionIdentifierToCourseSlug[subscriptionIdentifier];
