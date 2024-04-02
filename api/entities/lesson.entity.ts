import Joi from 'joi';
import {type TLessonType, type TLesson} from '../types/lesson.type.js';
import {CustomError} from '../utils/custom-error.js';
import {type TTags} from '../types/tag.type.js';
import {type TUuid} from '../types/uuid.type.js';

const lessonSchema = Joi.object({
	name: Joi.string().required().min(3).max(35),
	type: Joi.string().required().valid('video', 'text', 'courseWare'),
	description: Joi.string().min(10).max(150),
	content: Joi.string().allow(''),
	videoSourceUrl: Joi.string(),
	duration: Joi.number().min(1).max(200),
	thumbnailUrl: Joi.string().required(),
	modules: Joi.array().items(Joi.string().uuid()).required(),
	publicationDate: Joi.date().required().default(new Date()),
	published: Joi.boolean().required().default(true),
	tags: Joi.array().items(Joi.array().items(Joi.string()).min(2).max(2)).unique(),
});

export class Lesson implements TLesson {
	private readonly _name: string;
	private readonly _type: TLessonType;
	private readonly _description?: string;
	private readonly _content?: string;
	private readonly _videoSourceUrl?: string;
	private readonly _duration?: number;
	private readonly _thumbnailUrl: string;
	private readonly _modules: TUuid[];
	private readonly _publicationDate: Date;
	private readonly _published: boolean;
	private readonly _tags?: TTags;

	constructor(lesson: TLesson) {
		const {error} = lessonSchema.validate(lesson);

		if (error) {
			throw new CustomError('UNPROCESSABLE_ENTITY', `Invalid lesson data: ${error.message}`);
		}

		this._name = lesson.name;
		this._type = lesson.type;
		this._description = lesson.description;
		this._content = lesson.content;
		this._videoSourceUrl = lesson.videoSourceUrl;
		this._duration = lesson.duration;
		this._thumbnailUrl = lesson.thumbnailUrl;
		this._modules = lesson.modules;
		this._publicationDate = lesson.publicationDate;
		this._published = lesson.published;
		this._tags = lesson.tags;
	}

	get name() {
		return this._name;
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

	get videoSourceUrl() {
		return this._videoSourceUrl;
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

	get published() {
		return this._published;
	}

	get tags() {
		return this._tags;
	}
}
