import { type Prisma } from '@prisma/client';
import { type TAllDataToBeCached } from './get-all-data-to-be-cached.js';
import { memoryCache } from './memory-cache.js';
import { type TCourseDataForCache } from './populate-courses-to-cache.js';

type TLessonToModule = Prisma.LessonToModuleGetPayload<{
	include: {
		lesson: {
			include: {
				tags: true;
			};
		};
	};
}>;

export type TLessonDataForCache = {
	delegateAuthTo: string[];
} & TLessonToModule;

const getLessonDataForCache = (
	lessonToModule: TAllDataToBeCached['modules'][0]['module']['lessons'][0],
	delegateAuthTo: TCourseDataForCache['delegateAuthTo'],
): TLessonDataForCache => {
	const lessonDataForCache = {
		createdAt: lessonToModule.createdAt,
		delegateAuthTo,
		id: lessonToModule.id,
		isPublished: lessonToModule.isPublished,
		lesson: {
			content: lessonToModule.lesson.content,
			createdAt: lessonToModule.lesson.createdAt,
			description: lessonToModule.lesson.description,
			duration: lessonToModule.lesson.duration,
			id: lessonToModule.lesson.id,
			marketingContent: lessonToModule.lesson.marketingContent,
			marketingVideoUrl: lessonToModule.lesson.marketingVideoUrl,
			name: lessonToModule.lesson.name,
			oldId: lessonToModule.lesson.oldId,
			slug: lessonToModule.lesson.slug,
			tags: lessonToModule.lesson.tags,
			thumbnailUrl: lessonToModule.lesson.thumbnailUrl,
			type: lessonToModule.lesson.type,
			updatedAt: lessonToModule.lesson.updatedAt,
			videoSourceUrl: lessonToModule.lesson.videoSourceUrl,
		},
		lessonSlug: lessonToModule.lessonSlug,
		moduleSlug: lessonToModule.moduleSlug,
		order: lessonToModule.order,
		publicationDate: lessonToModule.publicationDate,
		updatedAt: lessonToModule.updatedAt,
	};

	return lessonDataForCache;
};

export const populateLessonsToCache = (
	lessonsToModule: TAllDataToBeCached['modules'][0]['module']['lessons'],
	delegateAuthTo: TCourseDataForCache['delegateAuthTo'],
) => {
	for (const lessonToModule of lessonsToModule) {
		const lessonDataForCache = getLessonDataForCache(
			lessonToModule,
			delegateAuthTo,
		);

		memoryCache.set(
			`${lessonToModule.moduleSlug}:${lessonToModule.lessonSlug}`,
			JSON.stringify(lessonDataForCache),
		);
	}
};
