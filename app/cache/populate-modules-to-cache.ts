import {type Prisma} from '@prisma/client';
import {memoryCache} from './memory-cache.js';
import {type TAllDataToBeCached} from './get-all-data-to-be-cached.js';
import {type TLessonDataForCache, populateLessonsToCache} from './populate-lessons-to-cache.js';
import {type TCourseDataForCache} from './populate-courses-to-cache.js';

export type TModuleToCourse = Prisma.ModuleToCourseGetPayload<{include: {module: true}}>;

export type TModuleDataForCache = {
	lessons: string[] | TLessonDataForCache[];
	delegateAuthTo: string[];
} & TModuleToCourse;

const getModuleDataForCache = (moduleToCourse: TAllDataToBeCached['modules'][0], delegateAuthTo: TCourseDataForCache['delegateAuthTo']): TModuleDataForCache => {
	const {module} = moduleToCourse;
	if (module.isLessonsOrderRandom) {
		for (let index = module.lessons.length - 1; index > 0; index -= 1) {
			const randomIndex = Math.floor(Math.random() * (index));
			[module.lessons[index], module.lessons[randomIndex]] = [module.lessons[randomIndex], module.lessons[index]];
		}
	} else if ((module.lessons).every(lesson => Boolean(lesson.order))) {
		module.lessons.sort((a, b) => a.order - b.order);
	}

	const lessons = module.lessons.map(lesson => lesson.lessonSlug);

	const moduleDataForCache = {
		id: moduleToCourse.id,
		moduleSlug: moduleToCourse.moduleSlug,
		courseSlug: moduleToCourse.courseSlug,
		order: moduleToCourse.order,
		isPublished: moduleToCourse.isPublished,
		publicationDate: moduleToCourse.publicationDate,
		createdAt: moduleToCourse.createdAt,
		updatedAt: moduleToCourse.updatedAt,
		lessons,
		delegateAuthTo,
		module: {
			id: moduleToCourse.module.id,
			oldId: moduleToCourse.module.oldId,
			name: moduleToCourse.module.name,
			slug: moduleToCourse.module.slug,
			description: moduleToCourse.module.description,
			content: moduleToCourse.module.content,
			marketingContent: moduleToCourse.module.marketingContent,
			videoSourceUrl: moduleToCourse.module.videoSourceUrl,
			marketingVideoUrl: moduleToCourse.module.marketingVideoUrl,
			thumbnailUrl: moduleToCourse.module.thumbnailUrl,
			createdAt: moduleToCourse.module.createdAt,
			updatedAt: moduleToCourse.module.updatedAt,
			isLessonsOrderRandom: moduleToCourse.module.isLessonsOrderRandom,
			showTagsFilters: moduleToCourse.module.showTagsFilters,
		},
	};

	return moduleDataForCache;
};

export const populateModulesAndLessonsToCache = (course: TAllDataToBeCached, delegateAuthTo: TCourseDataForCache['delegateAuthTo']) => {
	for (const moduleToCourse of course.modules) {
		const moduleDataForCache = getModuleDataForCache(moduleToCourse, delegateAuthTo);

		memoryCache.set(`${course.slug}:${moduleToCourse.module.slug}`, JSON.stringify(moduleDataForCache));
		populateLessonsToCache(moduleToCourse.module.lessons, delegateAuthTo);
	}
};
