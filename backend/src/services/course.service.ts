import CourseModel from '../models/course.model';
import {type Prisma} from '@prisma/client';

export default class CourseService {
	private readonly _model: CourseModel;

	constructor(model: CourseModel = new CourseModel()) {
		this._model = model;
	}

	public async create(courseData: Prisma.CourseCreateInput) {
		const createdCourse = await this._model.create(courseData);

		return createdCourse;
	}
}
