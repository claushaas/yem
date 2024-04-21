import {type Prisma} from '@prisma/client';
import {MemoryCache} from './memory-cache.js';
import {type TAllDataToBeCached} from './get-all-data-to-be-cached.js';
import {type TCourseDataForCache} from './populate-courses-to-cache.js';

type TLessonToModule = Prisma.LessonToModuleGetPayload<{
	include: {
		lesson: {
			include: {
				tags: true;
			};
		};
	};
}>;

type TLessonDataForCache = {
	delegateAuthTo: string[];
} & TLessonToModule;

const getLessonDataForCache = (lessonToModule: TAllDataToBeCached['modules'][0]['module']['lessons'][0], delegateAuthTo: TCourseDataForCache['delegateAuthTo']): TLessonDataForCache => {
	const lessonDataForCache = {
		id: lessonToModule.id,
		lessonId: lessonToModule.lessonId,
		moduleId: lessonToModule.moduleId,
		order: lessonToModule.order,
		isPublished: lessonToModule.isPublished,
		publicationDate: lessonToModule.publicationDate,
		createdAt: lessonToModule.createdAt,
		updatedAt: lessonToModule.updatedAt,
		delegateAuthTo,
		lesson: {
			id: lessonToModule.lesson.id,
			oldId: lessonToModule.lesson.oldId,
			name: lessonToModule.lesson.name,
			slug: lessonToModule.lesson.slug,
			type: lessonToModule.lesson.type,
			description: lessonToModule.lesson.description,
			content: lessonToModule.lesson.content,
			marketingContent: lessonToModule.lesson.marketingContent,
			videoSourceUrl: lessonToModule.lesson.videoSourceUrl,
			marketingVideoUrl: lessonToModule.lesson.marketingVideoUrl,
			thumbnailUrl: lessonToModule.lesson.thumbnailUrl,
			createdAt: lessonToModule.lesson.createdAt,
			updatedAt: lessonToModule.lesson.updatedAt,
			duration: lessonToModule.lesson.duration,
			tags: lessonToModule.lesson.tags,
		},
	};

	return lessonDataForCache;
};

export const populateLessonsToCache = (lessonsToModule: TAllDataToBeCached['modules'][0]['module']['lessons'], delegateAuthTo: TCourseDataForCache['delegateAuthTo']) => {
	for (const lessonToModule of lessonsToModule) {
		const lessonDataForCache = getLessonDataForCache(lessonToModule, delegateAuthTo);

		MemoryCache.set(`${lessonToModule.lesson.slug}:${lessonToModule.lesson.slug}`, JSON.stringify(lessonDataForCache));
	}
};
