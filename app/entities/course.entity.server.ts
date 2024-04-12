import Joi from 'joi';
import {type TCourse} from '../types/course.type.js';
import {CustomError} from '../utils/custom-error.js';
import {type TTags} from '../types/tag.type.js';

const courseSchema = Joi.object({
	name: Joi.string().required().min(3).max(35),
	description: Joi.string().min(10).max(150),
	content: Joi.string().allow(''),
	videoSourceUrl: Joi.string().allow(''),
	thumbnailUrl: Joi.string().required(),
	publicationDate: Joi.date().required().default(new Date()),
	published: Joi.boolean().required().default(true),
	isSelling: Joi.boolean().required().default(false),
	tags: Joi.array().items(Joi.array().items(Joi.string()).min(2).max(2)).unique(),
	delegateAuthTo: Joi.array().items(Joi.string()),
});

export class Course implements TCourse {
	private readonly _name: string;
	private readonly _slug: string;
	private readonly _description?: string;
	private readonly _content?: string;
	private readonly _videoSourceUrl?: string;
	private readonly _thumbnailUrl: string;
	private readonly _publicationDate: Date;
	private readonly _published: boolean;
	private readonly _isSelling: boolean;
	private readonly _tags?: TTags;
	private readonly _delegateAuthTo?: string[];

	constructor(course: TCourse) {
		const {error} = courseSchema.validate(course);

		if (error) {
			throw new CustomError('UNPROCESSABLE_ENTITY', `Invalid course data: ${error.message}`);
		}

		this._name = course.name;
		this._slug = this._name.toLowerCase().normalize('NFD').replaceAll(/[\u0300-\u036F]/g, '').replaceAll(' ', '-');
		this._description = course.description;
		this._content = course.content;
		this._videoSourceUrl = course.videoSourceUrl;
		this._thumbnailUrl = course.thumbnailUrl;
		this._publicationDate = course.publicationDate;
		this._published = course.published;
		this._isSelling = course.isSelling;
		this._tags = course.tags;
		this._delegateAuthTo = course.delegateAuthTo;
	}

	get name() {
		return this._name;
	}

	get slug() {
		return this._slug;
	}

	get description() {
		return this._description;
	}

	get content() {
		return this._content;
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

	get isSelling() {
		return this._isSelling;
	}

	get tags() {
		return this._tags;
	}

	get delegateAuthTo() {
		return this._delegateAuthTo;
	}
}
