import type { PrismaClient } from '@prisma/client';
import type { TGetLessonActivityForUser } from '~/types/lesson-activity.type.js';
import type { TServiceReturn } from '~/types/service-return.type.js';
import { logger } from '~/utils/logger.util.js';
import { database } from '../database/database.server.js';

export class LessonActivityService {
	private readonly _model: PrismaClient;

	constructor(model: PrismaClient = database) {
		this._model = model;
	}

	public async getCourseProgressForUser(
		courseSlug: string,
		userId: string | undefined,
	): Promise<
		TServiceReturn<{
			totalLessons: number | undefined;
			completedLessons: number | undefined;
			percentage: number | undefined;
		}>
	> {
		if (!userId) {
			return {
				data: {
					completedLessons: undefined,
					percentage: undefined,
					totalLessons: undefined,
				},
				status: 'SUCCESSFUL',
			};
		}

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
				userId,
			},
		});

		const data = {
			completedLessons,
			percentage:
				completedLessons === 0
					? 0
					: Math.round((completedLessons / totalLessons) * 100),
			totalLessons,
		};

		return {
			data,
			status: 'SUCCESSFUL',
		};
	}

	public async getModuleProgressForUser(
		moduleSlug: string,
		userId: string | undefined,
	): Promise<
		TServiceReturn<{
			totalLessons: number | undefined;
			completedLessons: number | undefined;
			percentage: number | undefined;
		}>
	> {
		if (!userId) {
			return {
				data: {
					completedLessons: undefined,
					percentage: undefined,
					totalLessons: undefined,
				},
				status: 'SUCCESSFUL',
			};
		}

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
				lesson: {
					modules: {
						some: {
							moduleSlug,
						},
					},
				},
				userId,
			},
		});

		const data = {
			completedLessons,
			percentage:
				completedLessons === 0
					? 0
					: Math.round((completedLessons / totalLessons) * 100),
			totalLessons,
		};

		return {
			data,
			status: 'SUCCESSFUL',
		};
	}

	public async getLessonActivityForUser(
		lessonSlug: string,
		userId: string | undefined,
	): Promise<TServiceReturn<TGetLessonActivityForUser>> {
		if (!userId) {
			return {
				data: {
					completed: undefined,
					favorited: undefined,
					saved: undefined,
				},
				status: 'SUCCESSFUL',
			};
		}

		try {
			const lesson = await this._model.lesson.findUnique({
				select: {
					completedBy: {
						select: {
							isCompleted: true,
						},
						where: {
							lessonSlug,
							userId,
						},
					},
					favoritedBy: {
						select: {
							isFavorited: true,
						},
						where: {
							lessonSlug,
							userId,
						},
					},
					savedBy: {
						select: {
							isSaved: true,
						},
						where: {
							lessonSlug,
							userId,
						},
					},
				},
				where: {
					slug: lessonSlug,
				},
			});

			return {
				data: {
					completed:
						(lesson?.completedBy &&
							lesson.completedBy.length > 0 &&
							lesson.completedBy[0].isCompleted) ??
						false,
					favorited:
						(lesson?.favoritedBy &&
							lesson.favoritedBy.length > 0 &&
							lesson.favoritedBy[0].isFavorited) ??
						false,
					saved:
						(lesson?.savedBy &&
							lesson.savedBy.length > 0 &&
							lesson.savedBy[0].isSaved) ??
						false,
				},
				status: 'SUCCESSFUL',
			};
		} catch (error) {
			logger.logError(
				`Error getting lesson activity for user: ${(error as Error).message}`,
			);
			throw new Error(
				`Error getting lesson activity for user: ${(error as Error).message}`,
			);
		}
	}

	public async togleLessonSavedForUser(
		lessonSlug: string,
		userId: string,
		alreadySaved: boolean,
	): Promise<TServiceReturn<string>> {
		try {
			await this._model.savedLessons.upsert({
				create: {
					isSaved: !alreadySaved,
					lessonSlug,
					userId,
				},
				update: {
					isSaved: !alreadySaved,
				},
				where: {
					userId_lessonSlug: {
						// eslint-disable-line @typescript-eslint/naming-convention
						lessonSlug,
						userId,
					},
				},
			});

			return {
				data: 'Lesson saved toggled successfully',
				status: 'SUCCESSFUL',
			};
		} catch (error) {
			logger.logError(
				`Error toggling lesson saved for user: ${(error as Error).message}`,
			);
			throw new Error(
				`Error toggling lesson saved for user: ${(error as Error).message}`,
			);
		}
	}

	public async togleLessonCompletedForUser(
		lessonSlug: string,
		userId: string,
		alreadyCompleted: boolean,
	): Promise<TServiceReturn<string>> {
		try {
			await this._model.completedLessons.upsert({
				create: {
					isCompleted: !alreadyCompleted,
					lessonSlug,
					userId,
				},
				update: {
					isCompleted: !alreadyCompleted,
				},
				where: {
					lessonSlug_userId: {
						// eslint-disable-line @typescript-eslint/naming-convention
						lessonSlug,
						userId,
					},
				},
			});

			return {
				data: 'Lesson completed toggled successfully',
				status: 'SUCCESSFUL',
			};
		} catch (error) {
			logger.logError(
				`Error toggling lesson completed for user: ${(error as Error).message}`,
			);
			throw new Error(
				`Error toggling lesson completed for user: ${(error as Error).message}`,
			);
		}
	}

	public async togleLessonFavoritedForUser(
		lessonSlug: string,
		userId: string,
		alreadyFavorited: boolean,
	): Promise<TServiceReturn<string>> {
		try {
			await this._model.favoritedLessons.upsert({
				create: {
					isFavorited: !alreadyFavorited,
					lessonSlug,
					userId,
				},
				update: {
					isFavorited: !alreadyFavorited,
				},
				where: {
					userId_lessonSlug: {
						// eslint-disable-line @typescript-eslint/naming-convention
						lessonSlug,
						userId,
					},
				},
			});

			return {
				data: 'Lesson favorited toggled successfully',
				status: 'SUCCESSFUL',
			};
		} catch (error) {
			logger.logError(
				`Error toggling lesson favorited for user: ${(error as Error).message}`,
			);
			throw new Error(
				`Error toggling lesson favorited for user: ${(error as Error).message}`,
			);
		}
	}
}
