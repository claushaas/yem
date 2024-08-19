export const convertNameToSlug = (name: string): string =>
	name
		.toLowerCase()
		.normalize('NFD')
		.replaceAll(/[\u0300-\u036F]/g, '')
		.replaceAll(/[^a-zA-Z\d\s]/g, '')
		.replaceAll(/\s+/g, '-');
