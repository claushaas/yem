export const generateSecurePassword = (): string =>
	crypto
		.getRandomValues(new Uint32Array(1))[0]
		.toString(36)
		.slice(-6) satisfies string;
