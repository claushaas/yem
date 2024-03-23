import {type TRepository} from '#/types/IRepository';
import {type TSearchableEntity} from '#/types/ISearchService';
import {CustomError} from '#/utils/CustomError';
import {PrismaClient} from '@prisma/client';

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
