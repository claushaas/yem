import {type TAllDataToBeCached} from './get-all-data-to-be-cached.js';
import {MemoryCache} from './memory-cache.js';

export const populateSubscriptionsToCache = (allDataToBeCached: TAllDataToBeCached[]) => {
	for (const course of allDataToBeCached) {
		for (const subscription of course.subscriptions) {
			MemoryCache.set(`${course.id}:${subscription.userId}`, JSON.stringify(subscription));
		}
	}
};
