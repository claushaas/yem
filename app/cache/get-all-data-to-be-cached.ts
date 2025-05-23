import { type Prisma } from '@prisma/client';
import { database } from '../database/database.server.js';

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

export const allDataToBeCached = async (): Promise<TAllDataToBeCached[]> =>
	database.course.findMany({
		include: {
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
			subscriptions: {
				where: {
					expiresAt: {
						gt: new Date(),
					},
				},
			},
		},
		orderBy: [{ order: 'asc' }, { name: 'asc' }],
	});
