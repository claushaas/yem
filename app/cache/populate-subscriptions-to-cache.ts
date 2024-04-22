import {type TAllDataToBeCached} from './get-all-data-to-be-cached.js';
import {memorycache} from './memory-cache.js';

export const populateSubscriptionsToCache = (allDataToBeCached: TAllDataToBeCached[]) => {
	for (const course of allDataToBeCached) {
		for (const subscription of course.subscriptions) {
			memorycache.set(`${subscription.courseSlug}:${subscription.userId}`, JSON.stringify(subscription));
		}
	}
};
