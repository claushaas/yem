import {allDataToBeCached} from './get-all-data-to-be-cached.js';
import {populateCoursesToCache} from './populate-courses-to-cache.js';

export const populateCache = () => {
	populateCoursesToCache(allDataToBeCached);
};
