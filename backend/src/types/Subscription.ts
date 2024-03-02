export type TypeSubscription = {
	userId: string;
	courseId: string;
	expiresAt: Date;
	provider: 'hotmart' | 'iugu';
	providerSubscriptionId: string;
};
