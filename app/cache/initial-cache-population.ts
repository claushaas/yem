import {allDataToBeCached} from './get-all-data-to-be-cached.js';
import {populateCoursesAndModulesAndLessonsToCache} from './populate-courses-to-cache.js';
import {populateSubscriptionsToCache} from './populate-subscriptions-to-cache.js';

export const populateCache = () => {
	populateCoursesAndModulesAndLessonsToCache(allDataToBeCached);
	populateSubscriptionsToCache(allDataToBeCached);
};
