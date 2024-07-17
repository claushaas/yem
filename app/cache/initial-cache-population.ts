import {allDataToBeCached} from './get-all-data-to-be-cached.js';
import {memoryCache} from './memory-cache.js';
import {populateCoursesAndModulesAndLessonsToCache} from './populate-courses-to-cache.js';
import {populateSubscriptionsToCache} from './populate-subscriptions-to-cache.js';
import {populateTagsToCache} from './populate-tags-to-cache.js';

export const populateCache = async () => {
	const dataToBeCached = await allDataToBeCached();
	memoryCache.clear();
	populateCoursesAndModulesAndLessonsToCache(dataToBeCached);
	populateSubscriptionsToCache(dataToBeCached);
	populateTagsToCache(dataToBeCached);
};
