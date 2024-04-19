import {db} from '../database/db.js';
import {MemoryCache} from './memory-cache.js';

export const populateCourses = async () => {
	const courses = await db.course.findMany({
		include: {
			modules: {
				select: {
					id: true,
					slug: true,
				},
			},
		},
	});

	for (const course of courses) {
		MemoryCache.set(`course:${course.slug}`, JSON.stringify(course));
	}
};

export const populateModules = async () => {
	const modules = await db.module.findMany({
		include: {
			course: {
				select: {
					id: true,
					slug: true,
				},
			},
			lessons: {
				select: {
					id: true,
					slug: true,
				},
			},
		},
	});

	for (const module of modules) {
		MemoryCache.set(`module:${module.slug}`, JSON.stringify(module));
	}
};

export const populateLessons = async () => {
	const lessons = await db.lesson.findMany({
		include: {
			modules: {
				select: {
					id: true,
					slug: true,
					course: {
						select: {
							id: true,
							slug: true,
						},
					},
				},
			},
			tags: {
				orderBy: {
					tagOptionName: 'asc',
					tagValueName: 'asc',
				},
			},
		},
	});

	for (const lesson of lessons) {
		MemoryCache.set(`lesson:${lesson.slug}`, JSON.stringify(lesson));
	}
};

export const populateSubscriptions = async () => {
	const [usersThatHaveSubscriptions, subscriptions] = await Promise.all([
		db.userSubscriptions.groupBy({
			by: 'userId',
		}),
		db.userSubscriptions.findMany(),
	]);

	const subscriptionsByUser = usersThatHaveSubscriptions.map(user => ({
		userId: user.userId,
		subscriptions: subscriptions.filter(subscription => subscription.userId === user.userId),
	}));

	for (const user of subscriptionsByUser) {
		MemoryCache.set(`subscriptions:${user.userId}`, JSON.stringify(user.subscriptions));
	}
};
