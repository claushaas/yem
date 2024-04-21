import {type Prisma} from '@prisma/client';
import {MemoryCache} from './memory-cache.js';
import {type TAllDataToBeCached} from './get-all-data-to-be-cached.js';
import {populateModulesAndLessonsToCache} from './populate-modules-to-cache.js';

type TCourse = Prisma.CourseGetPayload<undefined>;

export type TCourseDataForCache = {
	modules: string[];
	delegateAuthTo: string[];
} & TCourse;

const getCourseDataForCache = (course: TAllDataToBeCached): TCourseDataForCache => {
	const courseDataForCache = {
		id: course.id,
		oldId: course.oldId,
		slug: course.slug,
		description: course.description,
		content: course.content,
		name: course.name,
		marketingContent: course.marketingContent,
		videoSourceUrl: course.videoSourceUrl,
		marketingVideoUrl: course.marketingVideoUrl,
		thumbnailUrl: course.thumbnailUrl,
		createdAt: course.createdAt,
		updatedAt: course.updatedAt,
		publicationDate: course.publicationDate,
		isPublished: course.isPublished,
		isSelling: course.isSelling,
		delegateAuthTo: course.delegateAuthTo.map(delegateAuthTo => delegateAuthTo.id),
		modules: course.modules.sort((a, b) => a.order - b.order).map(moduleToCourse => moduleToCourse.module.slug),
	};

	return courseDataForCache;
};

const populateCourseToCache = (course: TAllDataToBeCached) => {
	const courseDataForCache = getCourseDataForCache(course);
	const {delegateAuthTo} = courseDataForCache;

	MemoryCache.set(course.slug, JSON.stringify(courseDataForCache));
	populateModulesAndLessonsToCache(course, delegateAuthTo);
};

export const populateCoursesAndModulesAndLessonsToCache = (allDataToBeCached: TAllDataToBeCached[]) => {
	for (const course of allDataToBeCached) {
		populateCourseToCache(course);
	}
};
