import {type Prisma, type PrismaClient} from '@prisma/client';
import {db} from '../database/db.js';
import {type TServiceReturn} from '~/types/service-return.type.js';

export class LessonActivityService {
	private readonly _model: PrismaClient;

	constructor(model: PrismaClient = db) {
		this._model = model;
	}

	public async getCourseCompletedLessonsForUser(courseSlug: string, userId: string): Promise<TServiceReturn<unknown>> {
		const completedLessons = await this._model.completedLessons.findMany({
			where: {
				userId,
				lesson: {
					modules: {
						some: {
							module: {
								courses: {
									some: {
										courseSlug,
									},
								},
							},
						},
					},
				},
			},
		});

		return {
			status: 'SUCCESSFUL',
			data: completedLessons,
		};
	}
}

type test = Prisma.LessonToModuleWhereInput;
