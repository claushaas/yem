import {type TypeLessonType, type TypeLesson} from '../types/Lesson.js';
import CustomError from '../utils/CustomError.js';
import {type TypeTags} from '../types/Tag.js';
import Joi from 'joi';
import {type TypeUuid} from '../types/UUID.js';

const lessonSchema = Joi.object({
	name: Joi.string().required().min(3).max(35),
	type: Joi.string().required().valid('video', 'text', 'courseWare'),
	description: Joi.string().min(10).max(150),
	content: Joi.string(),
	videoSourceUrl: Joi.string().uri(),
	thumbnailUrl: Joi.string().required().uri(),
	modules: Joi.array().items(Joi.string().uuid()).required(),
	publicationDate: Joi.date().required().default(new Date()),
	published: Joi.boolean().required().default(true),
	tags: Joi.array().items(Joi.array().items(Joi.string()).min(2).max(2)).unique(),
});

export default class Lesson implements TypeLesson {
	private readonly _name: string;
	private readonly _type: TypeLessonType;
	private readonly _description?: string;
	private readonly _content?: string;
	private readonly _videoSourceUrl?: string;
	private readonly _thumbnailUrl: string;
	private readonly _modules: TypeUuid[];
	private readonly _publicationDate: Date;
	private readonly _published: boolean;
	private readonly _tags?: TypeTags;

	constructor(lesson: TypeLesson) {
		const {error} = lessonSchema.validate(lesson);

		if (error) {
			throw new CustomError('UNPROCESSABLE_ENTITY', `Invalid lesson data: ${error.message}`);
		}

		this._name = lesson.name;
		this._type = lesson.type;
		this._description = lesson.description;
		this._content = lesson.content;
		this._videoSourceUrl = lesson.videoSourceUrl;
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
