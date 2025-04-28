import Joi from 'joi';
import { convertNameToSlug } from '~/utils/convert-name-to-slug.js';
import { type TLesson, type TLessonType } from '../types/lesson.type.js';
import { type TTags } from '../types/tag.type.js';
import { CustomError } from '../utils/custom-error.js';

const lessonSchema = Joi.object({
	content: Joi.string().allow(''),
	description: Joi.string().min(3).max(154).required(),
	duration: Joi.number().min(0).max(200),
	isPublished: Joi.boolean().default(false),
	marketingContent: Joi.string().allow(''),
	marketingVideoUrl: Joi.string().allow(''),
	modules: Joi.array().items(Joi.string()).unique(),
	name: Joi.string().required().min(3).max(100),
	oldId: Joi.string().allow(''),
	order: Joi.number().integer().default(0),
	publicationDate: Joi.date().default(new Date()),
	tags: Joi.array()
		.items(Joi.array().items(Joi.string()).min(2).max(2))
		.unique(),
	thumbnailUrl: Joi.string().required(),
	type: Joi.string().required().valid('video', 'text', 'courseWare'),
	videoSourceUrl: Joi.string().allow(''),
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
		const { error } = lessonSchema.validate(lesson);

		if (error) {
			throw new CustomError(
				'UNPROCESSABLE_ENTITY',
				`Invalid lesson data: ${error.message}`,
			);
		}

		this._oldId = lesson.oldId;
		this._name = lesson.name;
		this._slug = convertNameToSlug(this._name);
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
