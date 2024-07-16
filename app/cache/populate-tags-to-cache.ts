import {type TAllDataToBeCached} from './get-all-data-to-be-cached.js';
import {memoryCache} from './memory-cache.js';

const tagsDataToBeCached = (allDataToBeCached: TAllDataToBeCached[]) => {
	const tags = new Set<{tagOption: string; tagValue: string}>();

	for (const course of allDataToBeCached) {
		for (const moduleToCourse of course.modules) {
			for (const lessonToModule of moduleToCourse.module.lessons) {
				for (const tag of lessonToModule.lesson.tags) {
					tags.add({tagOption: tag.tagOptionName, tagValue: tag.tagValueName});
				}
			}
		}
	}

	return [...tags];
};

export const populateTagsToCache = (allDataToBeCached: TAllDataToBeCached[]) => {
	const tags = tagsDataToBeCached(allDataToBeCached);

	memoryCache.set('tags', JSON.stringify(tags));
};
