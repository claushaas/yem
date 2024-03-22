import {type IRepository} from '#/types/IRepository';
import {type SearchableEntity} from '#/types/ISearchService';
import CustomError from '#/utils/CustomError';
import { PrismaClient } from '@prisma/client';

export class CourseRepository implements IRepository<SearchableEntity> {
	constructor(private readonly _model: PrismaClient = new PrismaClient()) {}
	
	public async getAll() {
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

		return coursesForStudents;
	}
}
