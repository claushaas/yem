export type TSubscription = {
	userId: string;
	courseId: string;
	expiresAt: Date;
	provider: 'hotmart' | 'iugu' | 'manual';
	providerSubscriptionId: string;
};

export type THotmartSubscription = {
	subscription_id: string;
	date_next_charge: string;
	product: {
		id: number;
	};
};

export type TIuguSubscription = {
	id: string;
	plan_identifier: string;
	expires_at: string;
};
