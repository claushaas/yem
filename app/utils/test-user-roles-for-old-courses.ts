import { type TUser } from '~/types/user.type';

export const userHasOldFormationRoles = (user: TUser): boolean =>
	Boolean(
		user.roles?.some(
			(role) =>
				role === 'formacao2017' ||
				role === 'formacao2018' ||
				role === 'formacao20182' ||
				role === 'formacaoJan2019' ||
				role === 'formacaoMai2019' ||
				role === 'formacaoSet2019' ||
				role === 'formacaoJan2020' ||
				role === 'formacaoMai2020' ||
				role === 'formacaoSet2020' ||
				role === 'formacaoJan2021',
		),
	);

export const userHasYPGRoles = (user: TUser): boolean =>
	Boolean(user.roles?.some((role) => role === 'ypg'));

export const userHasVinyasaRoles = (user: TUser): boolean =>
	Boolean(user.roles?.some((role) => role === 'vinyasa'));
