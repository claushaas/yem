import {PrismaClient, type Prisma} from '@prisma/client';

export default class Course {
	private readonly _model: PrismaClient;

	constructor(model: PrismaClient = new PrismaClient()) {
		this._model = model;
	}

	public async create(courseData: Prisma.CourseCreateInput) {
		const createdCourse = await this._model.course.create({
			data: courseData,
		});

		return createdCourse;
	}

	public async update(courseId: string, courseData: Prisma.CourseUpdateInput) {
		const updatedCourse = await this._model.course.update({
			where: {id: courseId},
			data: courseData,
		});

		return updatedCourse;
	}

	public async delete(courseId: string) {
		const deletedCourse = await this._model.course.delete({
			where: {id: courseId},
		});

		return deletedCourse;
	}

	public async get(courseId: string) {
		const course = await this._model.course.findUnique({
			where: {id: courseId},
		});

		return course;
	}

	public async getAll() {
		const courses = await this._model.course.findMany();

		return courses;
	}

	public async getPublishedByRole(role: string) {
		const courses = await this._model.course.findMany({
			where: {
				roles: {
					some: {
						name: role,
					},
				},
				published: true,
			},
			include: {
				roles: true,
			},
		});

		return courses;
	}
}
