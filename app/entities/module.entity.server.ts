import Joi from 'joi';
import {type TModule} from '../types/module.type.js';
import {CustomError} from '../utils/custom-error.js';
import {type TTags} from '../types/tag.type.js';
import {convertNameToSlug} from '~/utils/convert-name-to-slug.js';

const moduleSchema = Joi.object({
	oldId: Joi.string().allow(''),
	name: Joi.string().required().min(3).max(50),
	description: Joi.string().min(3).max(154).required(),
	content: Joi.string().allow(''),
	marketingContent: Joi.string().allow(''),
	videoSourceUrl: Joi.string().allow(''),
	marketingVideoUrl: Joi.string().allow(''),
	thumbnailUrl: Joi.string().required(),
	publicationDate: Joi.date().default(new Date()),
	isPublished: Joi.boolean().default(false),
	courses: Joi.array().items(Joi.string()).unique(),
	isLessonsOrderRandom: Joi.boolean().required().default(false),
	showTagsFilters: Joi.boolean().default(false),
	order: Joi.number().integer().default(0),
});

export class Module implements TModule {
	private readonly _oldId?: string;
	private readonly _name: string;
	private readonly _slug: string;
	private readonly _description: string;
	private readonly _content?: string;
	private readonly _marketingContent?: string;
	private readonly _videoSourceUrl?: string;
	private readonly _marketingVideoUrl?: string;
	private readonly _thumbnailUrl: string;
	private readonly _publicationDate?: Date;
	private readonly _isPublished?: boolean;
	private readonly _courses?: string[];
	private readonly _tags?: TTags;
	private readonly _isLessonsOrderRandom: boolean;
	private readonly _showTagsFilters: boolean;
	private readonly _order?: number;

	constructor(module: TModule) {
		const {error} = moduleSchema.validate(module);

		if (error) {
			throw new CustomError('UNPROCESSABLE_ENTITY', `Invalid module data: ${error.message}`);
		}

		this._oldId = module.oldId;
		this._name = module.name;
		this._slug = convertNameToSlug(this._name);
		this._description = module.description;
		this._content = module.content;
		this._marketingContent = module.marketingContent;
		this._videoSourceUrl = module.videoSourceUrl;
		this._marketingVideoUrl = module.marketingVideoUrl;
		this._thumbnailUrl = module.thumbnailUrl;
		this._publicationDate = module.publicationDate;
		this._isPublished = module.isPublished;
		this._courses = module.courses;
		this._isLessonsOrderRandom = module.isLessonsOrderRandom ?? false;
		this._showTagsFilters = module.showTagsFilters ?? false;
		this._order = module.order;
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

	get courses() {
		return this._courses;
	}

	get order() {
		return this._order;
	}

	get tags() {
		return this._tags;
	}

	get isLessonsOrderRandom() {
		return this._isLessonsOrderRandom;
	}

	get showTagsFilters() {
		return this._showTagsFilters;
	}

	get isPublished() {
		return this._isPublished;
	}
}
