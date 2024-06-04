import Joi from 'joi';
import {type TLessonType, type TLesson} from '../types/lesson.type.js';
import {CustomError} from '../utils/custom-error.js';
import {type TTags} from '../types/tag.type.js';

const lessonSchema = Joi.object({
	oldId: Joi.string().allow(''),
	name: Joi.string().required().min(3).max(100),
	type: Joi.string().required().valid('video', 'text', 'courseWare'),
	description: Joi.string().min(10).max(154).required(),
	content: Joi.string().allow(''),
	marketingContent: Joi.string().allow(''),
	videoSourceUrl: Joi.string().allow(''),
	marketingVideoUrl: Joi.string().allow(''),
	thumbnailUrl: Joi.string().required(),
	modules: Joi.array().items(Joi.string()).unique(),
	tags: Joi.array().items(Joi.array().items(Joi.string()).min(2).max(2)).unique(),
	duration: Joi.number().min(0).max(200),
	order: Joi.number().integer().default(0),
	isPublished: Joi.boolean().default(false),
	publicationDate: Joi.date().default(new Date()),
});

export class Lesson implements TLesson {
	private readonly _oldId?: string;
	private readonly _name: string;
	private readonly _slug: string;
	private readonly _type: TLessonType;
	private readonly _description: string;
	private readonly _content?: string;
	private readonly _marketingContent?: string;
	private readonly _videoSourceUrl?: string;
	private readonly _marketingVideoUrl?: string;
	private readonly _thumbnailUrl: string;
	private readonly _modules?: string[];
	private readonly _tags?: TTags;
	private readonly _duration?: number;
	private readonly _order?: number;
	private readonly _isPublished?: boolean;
	private readonly _publicationDate?: Date;

	constructor(lesson: TLesson) {
		const {error} = lessonSchema.validate(lesson);

		if (error) {
			throw new CustomError('UNPROCESSABLE_ENTITY', `Invalid lesson data: ${error.message}`);
		}

		this._oldId = lesson.oldId;
		this._name = lesson.name;
		this._slug = this._name.toLowerCase().normalize('NFD').replaceAll(/[\u0300-\u036F]/g, '').replaceAll(/[^a-zA-Z\d\s]/g, '').replaceAll(' ', '-');
		this._type = lesson.type;
		this._description = lesson.description;
		this._content = lesson.content;
		this._marketingContent = lesson.marketingContent;
		this._videoSourceUrl = lesson.videoSourceUrl;
		this._marketingVideoUrl = lesson.marketingVideoUrl;
		this._duration = lesson.duration;
		this._thumbnailUrl = lesson.thumbnailUrl;
		this._modules = lesson.modules;
		this._publicationDate = lesson.publicationDate;
		this._order = lesson.order;
		this._isPublished = lesson.isPublished;
		this._tags = lesson.tags;
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

	get type() {
		return this._type;
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

	get duration() {
		return this._duration;
	}

	get thumbnailUrl() {
		return this._thumbnailUrl;
	}

	get modules() {
		return this._modules;
	}

	get publicationDate() {
		return this._publicationDate;
	}

	get order() {
		return this._order;
	}

	get isPublished() {
		return this._isPublished;
	}

	get tags() {
		return this._tags;
	}
}
