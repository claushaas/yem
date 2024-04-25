import {type Prisma, type PrismaClient} from '@prisma/client';
import {database} from '../database/database.server.js';
import {type TServiceReturn} from '~/types/service-return.type.js';

export class LessonActivityService {
	private readonly _model: PrismaClient;

	constructor(model: PrismaClient = database) {
		this._model = model;
	}

	public async getCourseProgressForUser(courseSlug: string, userId: string): Promise<TServiceReturn<unknown>> {
		const totalLessons = await this._model.lesson.count({
			where: {
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
		});

		const completedLessons = await this._model.completedLessons.count({
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

		const data = {
			totalLessons,
			completedLessons,
			percentage: Math.round((completedLessons / totalLessons) * 100),
		};

		return {
			status: 'SUCCESSFUL',
			data,
		};
	}

	public async getModuleProgressForUser(moduleSlug: string, userId: string): Promise<TServiceReturn<unknown>> {
		const totalLessons = await this._model.lesson.count({
			where: {
				modules: {
					some: {
						moduleSlug,
					},
				},
			},
		});

		const completedLessons = await this._model.completedLessons.count({
			where: {
				userId,
				lesson: {
					modules: {
						some: {
							moduleSlug,
						},
					},
				},
			},
		});

		const data = {
			totalLessons,
			completedLessons,
			percentage: Math.round((completedLessons / totalLessons) * 100),
		};

		return {
			status: 'SUCCESSFUL',
			data,
		};
	}
}

type test = Prisma.LessonToModuleWhereInput;
