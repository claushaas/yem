import {type Prisma} from '@prisma/client';
import {MemoryCache} from './memory-cache.js';
import {type TAllDataToBeCached} from './get-all-data-to-be-cached.js';

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
	modules: Array<{
		slug: string;
		courses: string[];
	}>;
	delegateAuthTo: string[];
} & TLessonToModule;

const getLessonDataForCache = (lessonToModule: TAllDataToBeCached['modules'][0]['module']['lessons'][0]): TLessonDataForCache => {
	const lessonDataForCache = {
		id: lessonToModule.id,
		lessonId: lessonToModule.lessonId,
		moduleId: lessonToModule.moduleId,
		order: lessonToModule.order,
		isPublished: lessonToModule.isPublished,
		publicationDate: lessonToModule.publicationDate,
		createdAt: lessonToModule.createdAt,
		updatedAt: lessonToModule.updatedAt,
		modules: lessonToModule.lesson.modules.map(moduleToCourse => ({
			slug: moduleToCourse.module.slug,
			courses: moduleToCourse.module.courses.map(course => course.course.slug),
		})),
		delegateAuthTo: [...new Set(lessonToModule.lesson.modules.flatMap(moduleToCourse => moduleToCourse.module.courses.flatMap(course => course.course.delegateAuthTo.map(delegateAuthTo => delegateAuthTo.id))))],
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

export const populateLessonsToCache = (lessonsToModule: TAllDataToBeCached['modules'][0]['module']['lessons'], moduleSlug: string) => {
	for (const lessonToModule of lessonsToModule) {
		const lessonDataForCache = getLessonDataForCache(lessonToModule);

		MemoryCache.set(`${moduleSlug}:${lessonToModule.lesson.slug}`, JSON.stringify(lessonDataForCache));
	}
};
