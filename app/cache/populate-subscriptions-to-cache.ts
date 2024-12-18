import {type TAllDataToBeCached} from './get-all-data-to-be-cached.js';
import {memoryCache} from './memory-cache.js';

export const populateSubscriptionsToCache = (allDataToBeCached: TAllDataToBeCached[]) => {
	for (const course of allDataToBeCached) {
		for (const subscription of course.subscriptions) {
			if (new Date(subscription.expiresAt) > new Date()) {
				memoryCache.set(`${subscription.courseSlug}:${subscription.userId}`, JSON.stringify(subscription));
			}
		}
	}
};
