import Joi from 'joi';
import {type TCourse} from '../types/course.type.js';
import {CustomError} from '../utils/custom-error.js';

const courseSchema = Joi.object({
	oldId: Joi.string().allow(''),
	name: Joi.string().required().min(3).max(50),
	description: Joi.string().min(10).max(154).required(),
	order: Joi.number().integer().min(0),
	content: Joi.string().allow(''),
	marketingContent: Joi.string().allow(''),
	videoSourceUrl: Joi.string().allow(''),
	marketingVideoUrl: Joi.string().allow(''),
	thumbnailUrl: Joi.string().required(),
	publicationDate: Joi.date().required().default(new Date()),
	isPublished: Joi.boolean().required().default(false),
	isSelling: Joi.boolean().required().default(false),
	tags: Joi.array().items(Joi.array().items(Joi.string()).min(2).max(2)).unique(),
	delegateAuthTo: Joi.array().items(Joi.string().allow('')),
});

export class Course implements TCourse {
	private readonly _oldId?: string;
	private readonly _name: string;
	private readonly _slug: string;
	private readonly _description: string;
	private readonly _order?: number;
	private readonly _content?: string;
	private readonly _marketingContent?: string;
	private readonly _videoSourceUrl?: string;
	private readonly _marketingVideoUrl?: string;
	private readonly _thumbnailUrl: string;
	private readonly _publicationDate: Date;
	private readonly _isPublished: boolean;
	private readonly _isSelling: boolean;
	private readonly _delegateAuthTo?: string[];

	constructor(course: TCourse) {
		const {error} = courseSchema.validate(course);

		if (error) {
			throw new CustomError('UNPROCESSABLE_ENTITY', `Invalid course data: ${error.message}`);
		}

		this._oldId = course.oldId;
		this._name = course.name;
		this._slug = this._name.toLowerCase().normalize('NFD').replaceAll(/[\u0300-\u036F]/g, '').replaceAll(' ', '-');
		this._description = course.description;
		this._order = course.order;
		this._content = course.content;
		this._marketingContent = course.marketingContent;
		this._videoSourceUrl = course.videoSourceUrl;
		this._marketingVideoUrl = course.marketingVideoUrl;
		this._thumbnailUrl = course.thumbnailUrl;
		this._publicationDate = course.publicationDate;
		this._isPublished = course.isPublished;
		this._isSelling = course.isSelling;
		this._delegateAuthTo = course.delegateAuthTo?.some(Boolean) ? course.delegateAuthTo : [];
	}

	get oldId() {
		return this._oldId;
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

	get order() {
		return this._order;
	}

	get content() {
		return this._content;
	}

	get marketingContent() {
		return this._marketingContent;
	}

	get videoSourceUrl() {
		return this._videoSourceUrl;
	}

	get marketingVideoUrl() {
		return this._marketingVideoUrl;
	}

	get thumbnailUrl() {
		return this._thumbnailUrl;
	}

	get publicationDate() {
		return this._publicationDate;
	}

	get isPublished() {
		return this._isPublished;
	}

	get isSelling() {
		return this._isSelling;
	}

	get delegateAuthTo() {
		return this._delegateAuthTo;
	}
}
