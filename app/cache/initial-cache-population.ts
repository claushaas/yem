import {type Prisma} from '@prisma/client';
import {db} from '../database/db.js';
import {MemoryCache} from './memory-cache.js';

const allDataToBeCached = await db.course.findMany({
	include: {
		subscriptions: true,
		modules: {
			include: {
				lessons: {
					include: {
						lesson: {
							include: {
								tags: true,
							},
						},
					},
				},
			},
		},
	},
});

type Course = Prisma.CourseGetPayload<undefined>;
type Module = Prisma.ModuleGetPayload<undefined>;
type Subscription = Prisma.UserSubscriptionsGetPayload<undefined>;
type LessonToModule = Prisma.LessonToModuleGetPayload<{include: {lesson: true}}>;

type CourseBruteData = Course & {
	modules: string[] | Module[];
	subscriptions?: Subscription[];
};

type courseDataForCache = {
	modules: string[];
} & Course;

const getCourseDataForCache = (course: CourseBruteData) => {
	const courseData = {...course};
	delete courseData.subscriptions;
	courseData.modules = course.modules.map(module => (module as Module).id) ?? [];
	return course as courseDataForCache;
};

type ModuleBruteData = {
	lessons: LessonToModule[] | string[];
} & Module;

type moduleDataForCache = {
	lessons: string[];
} & Module;

const getModuleDataForCache = (module: ModuleBruteData) => {
	const moduleData = {...module};
	moduleData.lessons = module.lessons.map(lessonToModule => (lessonToModule as LessonToModule).lesson.id) ?? [];
	return module as moduleDataForCache;
};

const populateCourseToCache = (course: Prisma.CourseGetPayload<{
	include: {
		modules: true;
		subscriptions: true;
	};
}>) => {
	const courseDataForCache = getCourseDataForCache(course);

	MemoryCache.set(course.slug, JSON.stringify(courseDataForCache));
};

const populateLessonsToCache = (module: typeof allDataToBeCached[0]['modules'][0]) => {
	for (const lessonToModule of module.lessons) {
		const lessonDataForCache = {...lessonToModule.lesson, order: lessonToModule.order};
		MemoryCache.set(`${module.slug}:${lessonToModule.lesson.slug}`, JSON.stringify(lessonDataForCache));
	}
};

const populateModulesToCache = (course: typeof allDataToBeCached[0]) => {
	for (const module of course.modules) {
		const moduleDataForCache = getModuleDataForCache(module);

		MemoryCache.set(`${course.slug}:${module.slug}`, JSON.stringify(moduleDataForCache));

		populateLessonsToCache(module);
	}
};

const populateUserSubscriptionsToCache = (course: typeof allDataToBeCached[0]) => {
	for (const _subscription of course.subscriptions) {
		const userIdsOfUsersOfSubscriptions = course.subscriptions.map(subscription => subscription.userId);
		const uniqueUserIdsOfSubscriptions = [...new Set(userIdsOfUsersOfSubscriptions)];

		for (const userId of uniqueUserIdsOfSubscriptions) {
			const userSubscriptions = course.subscriptions.filter(subscription => subscription.userId === userId);
			MemoryCache.set(`${course.slug}:${userId}`, JSON.stringify(userSubscriptions));
		}
	}
};

export const populateCache = () => {
	for (const course of allDataToBeCached) {
		populateCourseToCache(course);
		populateModulesToCache(course);
		populateUserSubscriptionsToCache(course);
	}
};
