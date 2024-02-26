import type TypeCourse from '../types/Course';
import Joi from 'joi';
import CustomError from '../utils/CustomError';

const courseSchema = Joi.object({
	name: Joi.string().required().min(3).max(35),
	description: Joi.string().min(10).max(150),
	content: Joi.string(),
	roles: Joi.array().items(Joi.string()).required(),
	videoSourceUrl: Joi.string().uri(),
	thumbnailUrl: Joi.string().required().uri(),
	publicationDate: Joi.date().required().default(new Date()),
	published: Joi.boolean().required().default(true),
});

export default class Course implements TypeCourse {
	private readonly _name: string;
	private readonly _description?: string;
	private readonly _content?: string;
	private readonly _roles: string[];
	private readonly _videoSourceUrl?: string;
	private readonly _thumbnailUrl: string;
	private readonly _publicationDate: Date;
	private readonly _published: boolean;

	constructor(course: TypeCourse) {
		const {error} = courseSchema.validate(course);

		if (error) {
			throw new CustomError('UNPROCESSABLE_ENTITY', `Invalid course data: ${error.message}`);
		}

		this._name = course.name;
		this._description = course.description;
		this._content = course.content;
		this._roles = course.roles;
		this._videoSourceUrl = course.videoSourceUrl;
		this._thumbnailUrl = course.thumbnailUrl;
		this._publicationDate = course.publicationDate;
		this._published = course.published;
	}

	get name() {
		return this._name;
	}

	get description() {
		return this._description;
	}

	get content() {
		return this._content;
	}

	get roles() {
		return this._roles;
	}

	get videoSourceUrl() {
		return this._videoSourceUrl;
	}

	get thumbnailUrl() {
		return this._thumbnailUrl;
	}

	get publicationDate() {
		return this._publicationDate;
	}

	get published() {
		return this._published;
	}
}
