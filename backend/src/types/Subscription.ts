export type TypeSubscription = {
	userId: string;
	courseId: string;
	expiresAt: Date;
	provider: 'hotmart' | 'iugu';
	providerSubscriptionId: string;
};

export type TypeHotmartSubscription = {
	subscription_id: string;
	date_next_charge: string;
	product: {
		id: number;
	};
};

export type TypeIuguSubscription = {
	id: string;
	plan_identifier: string;
	expires_at: string;
};
