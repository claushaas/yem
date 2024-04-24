import {allDataToBeCached} from './get-all-data-to-be-cached.js';
import {populateCoursesAndModulesAndLessonsToCache} from './populate-courses-to-cache.js';
import {populateSubscriptionsToCache} from './populate-subscriptions-to-cache.js';

export const populateCache = async () => {
	const dataToBeCached = await allDataToBeCached();
	console.log('Populating cache with data:', dataToBeCached);
	populateCoursesAndModulesAndLessonsToCache(dataToBeCached);
	populateSubscriptionsToCache(dataToBeCached);
};
