import {type Prisma} from '@prisma/client';
import {db} from '../database/db.js';

export type TAllDataToBeCached = Prisma.CourseGetPayload<{
	include: {
		subscriptions: true;
		delegateAuthTo: {
			select: {
				id: true;
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

export const allDataToBeCached: TAllDataToBeCached[] = await db.course.findMany({
	include: {
		subscriptions: true,
		delegateAuthTo: {
			select: {
				id: true,
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
