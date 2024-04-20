import Joi from 'joi';
import {type TModule} from '../types/module.type.js';
import {CustomError} from '../utils/custom-error.js';
import {type TTags} from '../types/tag.type.js';

const moduleSchema = Joi.object({
	oldId: Joi.string().allow(''),
	name: Joi.string().required().min(3).max(35),
	description: Joi.string().min(10).max(150),
	content: Joi.string().allow(''),
	marketingContent: Joi.string().allow(''),
	videoSourceUrl: Joi.string().allow(''),
	marketingVideoUrl: Joi.string().allow(''),
	thumbnailUrl: Joi.string().required(),
	publicationDate: Joi.date().required().default(new Date()),
	published: Joi.boolean().required().default(true),
	courses: Joi.array().items(Joi.string().uuid()),
	lessons: Joi.array().items(Joi.string().uuid()),
	tags: Joi.array().items(Joi.array().items(Joi.string()).min(2).max(2)).unique(),
	isLessonsOrderRandom: Joi.boolean().required().default(false),
});

export class Module implements TModule {
	private readonly _oldId?: string;
	private readonly _name: string;
	private readonly _slug: string;
	private readonly _description?: string;
	private readonly _content?: string;
	private readonly _marketingContent?: string;
	private readonly _videoSourceUrl?: string;
	private readonly _marketingVideoUrl?: string;
	private readonly _thumbnailUrl: string;
	private readonly _publicationDate: Date;
	private readonly _published: boolean;
	private readonly _courses?: string[];
	private readonly _lessons?: string[];
	private readonly _tags?: TTags;
	private readonly _isLessonsOrderRandom: boolean;

	constructor(module: TModule) {
		const {error} = moduleSchema.validate(module);

		if (error) {
			throw new CustomError('UNPROCESSABLE_ENTITY', `Invalid module data: ${error.message}`);
		}

		this._oldId = module.oldId;
		this._name = module.name;
		this._slug = this._name.toLowerCase().normalize('NFD').replaceAll(/[\u0300-\u036F]/g, '').replaceAll(' ', '-');
		this._description = module.description;
		this._content = module.content;
		this._marketingContent = module.marketingContent;
		this._videoSourceUrl = module.videoSourceUrl;
		this._marketingVideoUrl = module.marketingVideoUrl;
		this._thumbnailUrl = module.thumbnailUrl;
		this._publicationDate = module.publicationDate;
		this._published = module.published;
		this._courses = module.courses;
		this._lessons = module.lessons;
		this._tags = module.tags;
		this._isLessonsOrderRandom = module.isLessonsOrderRandom;
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

	get published() {
		return this._published;
	}

	get courses() {
		return this._courses;
	}

	get lessons() {
		return this._lessons;
	}

	get tags() {
		return this._tags;
	}

	get isLessonsOrderRandom() {
		return this._isLessonsOrderRandom;
	}
}
