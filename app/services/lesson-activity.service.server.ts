import {type Prisma, type PrismaClient} from '@prisma/client';
import {database} from '../database/database.server.js';
import {type TServiceReturn} from '~/types/service-return.type.js';
import {type TGetLessonActivityForUser} from '~/types/lesson-activity.type.js';
import {logger} from '~/utils/logger.util.js';

export class LessonActivityService {
	private readonly _model: PrismaClient;

	constructor(model: PrismaClient = database) {
		this._model = model;
	}

	public async getCourseProgressForUser(courseSlug: string, userId: string): Promise<TServiceReturn<{
		totalLessons: number;
		completedLessons: number;
		percentage: number;
	}>> {
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
			percentage: completedLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100),
		};

		return {
			status: 'SUCCESSFUL',
			data,
		};
	}

	public async getModuleProgressForUser(moduleSlug: string, userId: string): Promise<TServiceReturn<{
		totalLessons: number;
		completedLessons: number;
		percentage: number;
	}>> {
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
			percentage: completedLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100),
		};

		return {
			status: 'SUCCESSFUL',
			data,
		};
	}

	public async getLessonActivityForUser(lessonSlug: string, userId: string): Promise<TServiceReturn<TGetLessonActivityForUser>> {
		try {
			const lesson = await this._model.lesson.findUnique({
				where: {
					slug: lessonSlug,
				},
				select: {
					completedBy: {
						where: {
							userId,
							lessonSlug,
						},
						select: {
							isCompleted: true,
						},
					},
					savedBy: {
						where: {
							userId,
							lessonSlug,
						},
						select: {
							isSaved: true,
						},
					},
					favoritedBy: {
						where: {
							userId,
							lessonSlug,
						},
						select: {
							isFavorited: true,
						},
					},
				},
			});

			return {
				status: 'SUCCESSFUL',
				data: {
					saved: (lesson?.savedBy && lesson.savedBy.length > 0 && lesson.savedBy[0].isSaved) ?? false,
					completed: (lesson?.completedBy && lesson.completedBy.length > 0 && lesson.completedBy[0].isCompleted) ?? false,
					favorited: (lesson?.favoritedBy && lesson.favoritedBy.length > 0 && lesson.favoritedBy[0].isFavorited) ?? false,
				},
			};
		} catch (error) {
			logger.logError(`Error getting lesson activity for user: ${(error as Error).message}`);
			throw new Error(`Error getting lesson activity for user: ${(error as Error).message}`);
		}
	}

	public async togleLessonSavedForUser(lessonSlug: string, userId: string, alreadySaved: boolean): Promise<TServiceReturn<string>> {
		try {
			await this._model.savedLessons.upsert({
				where: {
					userId_lessonSlug: { // eslint-disable-line @typescript-eslint/naming-convention
						userId,
						lessonSlug,
					},
				},
				create: {
					userId,
					lessonSlug,
					isSaved: !alreadySaved,
				},
				update: {
					isSaved: !alreadySaved,
				},
			});

			return {
				status: 'SUCCESSFUL',
				data: 'Lesson saved toggled successfully',
			};
		} catch (error) {
			logger.logError(`Error toggling lesson saved for user: ${(error as Error).message}`);
			throw new Error(`Error toggling lesson saved for user: ${(error as Error).message}`);
		}
	}

	public async togleLessonCompletedForUser(lessonSlug: string, userId: string, alreadyCompleted: boolean): Promise<TServiceReturn<string>> {
		try {
			await this._model.completedLessons.upsert({
				where: {
					lessonSlug_userId: { // eslint-disable-line @typescript-eslint/naming-convention
						lessonSlug,
						userId,
					},
				},
				create: {
					userId,
					lessonSlug,
					isCompleted: !alreadyCompleted,
				},
				update: {
					isCompleted: !alreadyCompleted,
				},
			});

			return {
				status: 'SUCCESSFUL',
				data: 'Lesson completed toggled successfully',
			};
		} catch (error) {
			logger.logError(`Error toggling lesson completed for user: ${(error as Error).message}`);
			throw new Error(`Error toggling lesson completed for user: ${(error as Error).message}`);
		}
	}

	public async togleLessonFavoritedForUser(lessonSlug: string, userId: string, alreadyFavorited: boolean): Promise<TServiceReturn<string>> {
		try {
			await this._model.favoritedLessons.upsert({
				where: {
					userId_lessonSlug: { // eslint-disable-line @typescript-eslint/naming-convention
						userId,
						lessonSlug,
					},
				},
				create: {
					userId,
					lessonSlug,
					isFavorited: !alreadyFavorited,
				},
				update: {
					isFavorited: !alreadyFavorited,
				},
			});

			return {
				status: 'SUCCESSFUL',
				data: 'Lesson favorited toggled successfully',
			};
		} catch (error) {
			logger.logError(`Error toggling lesson favorited for user: ${(error as Error).message}`);
			throw new Error(`Error toggling lesson favorited for user: ${(error as Error).message}`);
		}
	}
}

type test = Prisma.LessonToModuleWhereInput;
