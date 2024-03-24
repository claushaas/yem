import {PrismaClient} from '@prisma/client';
import {type TRepository} from '#/types/repository.js';
import {type TSearchableEntity} from '#/types/search-service.js';
import {CustomError} from '#/utils/custom-error.js';

export class CourseRepository implements TRepository<TSearchableEntity> {
	private readonly _model: PrismaClient;

	constructor(model: PrismaClient = new PrismaClient()) {
		this._model = model;
	}

	public async getAll(): Promise<TSearchableEntity[]> {
		const select = {
			name: true,
			description: true,
			thumbnailUrl: true,
			publicationDate: true,
			published: true,
		};

		const coursesForStudents = await this._model.course.findMany({
			select,
			where: {
				published: true,
			},
		});

		if (coursesForStudents.length === 0) {
			throw new CustomError('NOT_FOUND', 'No courses found');
		}

		return coursesForStudents as TSearchableEntity[];
	}
}
