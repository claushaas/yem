import {type Prisma} from '@prisma/client';
import {MemoryCache} from './memory-cache.js';
import {type TAllDataToBeCached} from './get-all-data-to-be-cached.js';
import {populateLessonsToCache} from './populate-lessons-to-cache.js';

type TModuleToCourse = Prisma.ModuleToCourseGetPayload<{include: {module: true}}>;

type TModuleDataForCache = {
	lessons: string[];
	courses: string[];
	delegateAuthTo: string[];
} & TModuleToCourse;

const getModuleDataForCache = (moduleToCourse: TAllDataToBeCached['modules'][0]): TModuleDataForCache => {
	const {module} = moduleToCourse;
	if (module.isLessonsOrderRandom) {
		for (let index = module.lessons.length - 1; index > 0; index -= 1) {
			const randomIndex = Math.floor(Math.random() * (index));
			[module.lessons[index], module.lessons[randomIndex]] = [module.lessons[randomIndex], module.lessons[index]];
		}
	} else if ((module.lessons).every(lesson => Boolean(lesson.order))) {
		module.lessons = module.lessons.sort((a, b) => a.order - b.order);
	}

	const lessons = module.lessons.map(lesson => lesson.id);

	const moduleDataForCache = {
		id: moduleToCourse.id,
		moduleId: moduleToCourse.moduleId,
		courseId: moduleToCourse.courseId,
		order: moduleToCourse.order,
		isPublished: moduleToCourse.isPublished,
		publicationDate: moduleToCourse.publicationDate,
		createdAt: moduleToCourse.createdAt,
		updatedAt: moduleToCourse.updatedAt,
		lessons,
		courses: moduleToCourse.module.courses.map(course => course.course.slug),
		delegateAuthTo: [...new Set(moduleToCourse.module.courses.flatMap(course => course.course.delegateAuthTo.map(delegateAuthTo => delegateAuthTo.id)))],
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
		},
	};

	return moduleDataForCache;
};

export const populateModulesAndLessonsToCache = (course: TAllDataToBeCached) => {
	for (const moduleToCourse of course.modules) {
		const moduleDataForCache = getModuleDataForCache(moduleToCourse);

		MemoryCache.set(`${course.slug}:${moduleToCourse.module.slug}`, JSON.stringify(moduleDataForCache));
		populateLessonsToCache(moduleToCourse.module.lessons, moduleToCourse.module.slug);
	}
};
