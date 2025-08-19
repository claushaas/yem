import type { Prisma } from '@prisma/client';
import type { TAllDataToBeCached } from './get-all-data-to-be-cached.js';
import { memoryCache } from './memory-cache.js';
import {
	populateModulesAndLessonsToCache,
	type TModuleDataForCache,
} from './populate-modules-to-cache.js';

type TCourse = Prisma.CourseGetPayload<undefined>;

export type TCourseDataForCache = {
	modules: string[] | TModuleDataForCache[];
	delegateAuthTo: string[];
} & TCourse;

const getCourseDataForCache = (
	course: TAllDataToBeCached,
): TCourseDataForCache => {
	course.modules.sort((a, b) => a.order - b.order);
	const modules = course.modules.map(
		(moduleToCourse) => moduleToCourse.module.slug,
	);

	const courseDataForCache = {
		content: course.content,
		createdAt: course.createdAt,
		delegateAuthTo: course.delegateAuthTo.map(
			(delegateAuthTo) => delegateAuthTo.slug,
		),
		description: course.description,
		id: course.id,
		isPublished: course.isPublished,
		isSelling: course.isSelling,
		marketingContent: course.marketingContent,
		marketingVideoUrl: course.marketingVideoUrl,
		modules,
		name: course.name,
		oldId: course.oldId,
		order: course.order,
		publicationDate: course.publicationDate,
		slug: course.slug,
		thumbnailUrl: course.thumbnailUrl,
		updatedAt: course.updatedAt,
		videoSourceUrl: course.videoSourceUrl,
	};

	return courseDataForCache;
};

const populateCourseToCache = (course: TAllDataToBeCached) => {
	const courseDataForCache = getCourseDataForCache(course);
	const { delegateAuthTo } = courseDataForCache;

	memoryCache.set(`course:${course.slug}`, JSON.stringify(courseDataForCache));
	populateModulesAndLessonsToCache(course, delegateAuthTo);
};

export const populateCoursesAndModulesAndLessonsToCache = (
	allDataToBeCached: TAllDataToBeCached[],
) => {
	for (const course of allDataToBeCached) {
		populateCourseToCache(course);
	}
};
