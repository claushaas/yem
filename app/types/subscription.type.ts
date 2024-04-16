import {type Prisma} from '@prisma/client';
import {type subscriptionIdentifierToCourseId} from '~/utils/subscription-identifier-to-course-id.js';

export type TSubscription = {
	userId: string;
	courseId: string;
	expiresAt: Date;
	provider: 'hotmart' | 'iugu' | 'manual';
	providerSubscriptionId: string;
};

export type THotmartSubscription = {
	accession_date: string;
	subscriber_code: string;
	date_next_charge: string;
	product: {
		id: number;
	};
	plan: {
		name: string;
		id: number;
		recurrency_period: number;
		max_charge_cycles: number;
	};
};

export type THotmartFormationPurchase = {
	purchase: {
		payment: {
			type: string;
			method: string;
			installments_number: number;
		};
		transaction: string;
		approved_date: Date;
		recurrency_number: number;
		warranty_expire_date: Date;
		order_date: Date;
		offer: {
			code: string;
			payment_mode: string; // 'MULTIPLE_PAYMENTS'
		};
		is_subscription: false;
		status: 'COMPLETE';
	};
	product: {
		id: number;
		name: string;
	};
	buyer: {
		ucode: string;
		email: string;
		name: string;
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

export type TPrismaPayloadGetUserSubscriptions = Prisma.UserSubscriptionsGetPayload<{
	include: {
		course: {
			select: {
				id: true;
				name: true;
				slug: true;
			};
		};
	};
}>;

export type TIncommingHotmartWebhook = {
	data: {
		product: {
			has_co_production: boolean;
			name: string;
			id: number;
			ucode: string;
		};
		commissions: Array<{
			currency_value: string;
			source: string;
			value: number;
		}>;
		purchase: {
			original_offer_price: {
				currency_value: string;
				value: number;
			};
			recurrence_number?: number;
			subscription_anticipation_purchase: boolean;
			checkout_country: {
				iso: string;
				name: string;
			};
			order_bump: {
				is_order_bump: boolean;
			};
			approved_date?: Date;
			offer: {
				code: string;
			};
			order_date: Date;
			date_next_charge?: Date;
			price: {
				currency_value: string;
				value: number;
			};
			payment: {
				billet_url?: string;
				billet_barcode?: string;
				pix_qrcode?: string;
				pix_expiration_date?: Date;
				pix_code?: string;
				refusal_reason?: string;
				installments_number: 12;
				type: string;
			};
			full_price: {
				currency_value: string;
				value: number;
			};
			invoice_by: string;
			transaction: string;
			status: string;
		};
		affiliates: Array<{
			affiliate_code: string;
			name: string;
		}>;
		producer: {
			name: string;
		};
		subscription?: {
			subscriber: {
				code: string;
			};
			plan?: {
				name: string;
				id: number;
			};
			status: string;
		};
		buyer: {
			address: {
				zipcode: string;
				country: string;
				number: string;
				address: string;
				city: string;
				state: string;
				neighborhood: string;
				country_iso: string;
			};
			document: string;
			name: string;
			checkout_phone: string;
			email: string;
		};
	};
	id: string;
	creation_date: Date;
	event: string;
	version: string;
};
