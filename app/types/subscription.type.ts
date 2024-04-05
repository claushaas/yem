import {type subscriptionIdentifierToCourseId} from '~/utils/subscription-identifier-to-course-id.js';

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

export type TPlanIdentifier = keyof typeof subscriptionIdentifierToCourseId;

export type TIuguSubscriptionResponse = {
	id: string;
	suspended: boolean;
	plan_identifier: TPlanIdentifier;
	customer_email: string;
	expires_at: string;
	created_at: string;
	updated_at: string;
	active: boolean;
};
