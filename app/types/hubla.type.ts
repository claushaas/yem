export type THublaInvoiceEvents = {
	'type': 'invoice.created' | 'invoice.status_updated' | 'invoice.payment_succeeded' | 'invoice.payment_failed' | 'invoice.expired' | 'invoice.refunded';
	'event': {
		'product': {
			'id': string;
			'name': string;
		};
		'products': [{
			'id': string;
			'name': string;
			'offers': Array<{
				'id': string;
				'name': string;
				'cohorts': Array<{'id': string}>;
			}>;
		}];
		'invoice': {
			'id': string;
			'subscriptionId': string;
			'payerId': string;
			'sellerId': string;
			'installments': number;
			'paymentMethod': string;
			'currency': string;
			'type': string;
			'status': string;
			'statusAt': Array<{
				'status': string;
				'when': string;
			}>;
			'amount': {
				'subtotalCents': number;
				'discountCents': number;
				'prorataCents': number;
				'installmentFeeCents': number;
				'totalCents': number;
			};
			'receivers': Array<{
				'id': string;
				'name': string;
				'email': string;
				'phone': string;
				'role': string;
				'paysForFees': boolean;
				'totalCents': number;
			}>;
			'firstPaymentSession': {
				'ip': string;
				'utm': {
					'source': string;
					'medium': string;
					'campaign': string;
					'content': string;
					'term': string;
				};
			};
			'billingAddress': {
				'countryCode': string;
				'state': string;
				'city': string;
				'neighborhood': string;
				'street': string;
				'complement': string;
				'number': string;
				'postalCode': string;
			};
			'smartInstallment': {
				'sourceInvoiceId': string;
				'installment': number;
				'installments': number;
			};
			'saleDate': string;
			'dueDate': string;
			'createdAt': string;
			'modifiedAt': string;
			'version': number;
		};
		'user': {
			'id': string;
			'firstName': string;
			'lastName': string;
			'document': string;
			'email': string;
			'phone': string;
		};
	};
	'version': string;
};

export type THublaSubscriptionEvents = {
	'type': 'customer.member_added' | 'customer.member_removed';
	'event': {
		'product': {
			'id': string;
			'name': string;
		};
		'products': Array<{
			'id': string;
			'name': string;
			'offers': Array<{
				'id': string;
				'name': string;
				'cohorts': Array<{'id': string}>;
			}>;
		}>;
		'subscription': {
			'id': string;
			'sellerId': string;
			'payerId': string;
			'type': 'recurring' | 'one_time' | 'free';
			'status': 'active' | 'inactive';
			'billingCycleMonths': 1 | 3 | 6 | 12;
			'credits': number;
			'paymentMethod': 'credit_card' | 'pix' | 'bank_slip';
			'autoRenew': boolean;
			'freeTrial': boolean;
			'activatedAt': string;
			'modifiedAt': string;
			'createdAt': string;
			'firstPaymentSession': {
				'ip': string;
				'utm': {
					'source': string;
					'medium': string;
					'campaign': string;
					'content': string;
					'term': string;
				};
			};
			'version': number;
		};
		'user': {
			'id': string;
			'firstName': string;
			'lastName': string;
			'document': string;
			'email': string;
			'phone': string;
		};
	};
	'version': string;
};

export type THublaEvents = THublaInvoiceEvents | THublaSubscriptionEvents;
