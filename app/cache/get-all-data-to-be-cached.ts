import {type Prisma} from '@prisma/client';
import {db} from '../database/db.js';

export type TAllDataToBeCached = Prisma.CourseGetPayload<{
	include: {
		subscriptions: true;
		delegateAuthTo: {
			select: {
				slug: true;
			};
		};
		modules: {
			include: {
				module: {
					include: {
						lessons: {
							include: {
								lesson: {
									include: {
										tags: true;
									};
								};
							};
						};
					};
				};
			};
		};
	};
}>;

export const allDataToBeCached = async (): Promise<TAllDataToBeCached[]> => db.course.findMany({
	orderBy: {
		name: 'asc',
	},
	include: {
		subscriptions: true,
		delegateAuthTo: {
			select: {
				slug: true,
			},
		},
		modules: {
			include: {
				module: {
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
		},
	},
});
