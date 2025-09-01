import type { Prisma } from '@prisma/client';
import type { TAllDataToBeCached } from './get-all-data-to-be-cached.js';
import { memoryCache } from './memory-cache.js';
import type { TCourseDataForCache } from './populate-courses-to-cache.js';
import {
	populateLessonsToCache,
	type TLessonDataForCache,
} from './populate-lessons-to-cache.js';

export type TModuleToCourse = Prisma.ModuleToCourseGetPayload<{
	include: { module: true };
}>;

export type TModuleDataForCache = {
	lessons: string[] | TLessonDataForCache[];
	delegateAuthTo: string[];
} & TModuleToCourse;

const getModuleDataForCache = (
	moduleToCourse: TAllDataToBeCached['modules'][0],
	delegateAuthTo: TCourseDataForCache['delegateAuthTo'],
): TModuleDataForCache => {
	const { module } = moduleToCourse;
	if (module.isLessonsOrderRandom) {
		for (let index = module.lessons.length - 1; index > 0; index -= 1) {
			const randomIndex = Math.floor(Math.random() * index);
			[module.lessons[index], module.lessons[randomIndex]] = [
				module.lessons[randomIndex],
				module.lessons[index],
			];
		}
	} else if (module.lessons.every((lesson) => Boolean(lesson.order))) {
		module.lessons.sort((a, b) => a.order - b.order);
	}

	const lessons = module.lessons.map((lesson) => lesson.lessonSlug);

	const moduleDataForCache = {
		courseSlug: moduleToCourse.courseSlug,
		createdAt: moduleToCourse.createdAt,
		delegateAuthTo,
		id: moduleToCourse.id,
		isPublished: moduleToCourse.isPublished,
		lessons,
		module: {
			content: moduleToCourse.module.content,
			createdAt: moduleToCourse.module.createdAt,
			description: moduleToCourse.module.description,
			id: moduleToCourse.module.id,
			isLessonsOrderRandom: moduleToCourse.module.isLessonsOrderRandom,
			marketingContent: moduleToCourse.module.marketingContent,
			marketingVideoUrl: moduleToCourse.module.marketingVideoUrl,
			name: moduleToCourse.module.name,
			oldId: moduleToCourse.module.oldId,
			showTagsFilters: moduleToCourse.module.showTagsFilters,
			slug: moduleToCourse.module.slug,
			thumbnailUrl: moduleToCourse.module.thumbnailUrl,
			updatedAt: moduleToCourse.module.updatedAt,
			videoSourceUrl: moduleToCourse.module.videoSourceUrl,
		},
		moduleSlug: moduleToCourse.moduleSlug,
		order: moduleToCourse.order,
		publicationDate: moduleToCourse.publicationDate,
		updatedAt: moduleToCourse.updatedAt,
	};

	return moduleDataForCache;
};

export const populateModulesAndLessonsToCache = (
	course: TAllDataToBeCached,
	delegateAuthTo: TCourseDataForCache['delegateAuthTo'],
) => {
	for (const moduleToCourse of course.modules) {
		const moduleDataForCache = getModuleDataForCache(
			moduleToCourse,
			delegateAuthTo,
		);

		memoryCache.set(
			`${course.slug}:${moduleToCourse.module.slug}`,
			JSON.stringify(moduleDataForCache),
		);
		populateLessonsToCache(moduleToCourse.module.lessons, delegateAuthTo);
	}
};
