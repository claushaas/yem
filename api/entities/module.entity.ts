import {type TypeModule} from '../types/Module.js';
import CustomError from '../utils/CustomError.js';
import {type TypeTags} from '../types/Tag.js';
import Joi from 'joi';

const moduleSchema = Joi.object({
	name: Joi.string().required().min(3).max(35),
	description: Joi.string().min(10).max(150),
	content: Joi.string(),
	videoSourceUrl: Joi.string().uri(),
	thumbnailUrl: Joi.string().required().uri(),
	publicationDate: Joi.date().required().default(new Date()),
	published: Joi.boolean().required().default(true),
	courses: Joi.array().items(Joi.string().uuid()),
	lessons: Joi.array().items(Joi.string().uuid()),
	subModules: Joi.array().items(Joi.string().uuid()),
	belongToModules: Joi.array().items(Joi.string().uuid()),
	tags: Joi.array().items(Joi.array().items(Joi.string()).min(2).max(2)).unique(),
});

export default class Module implements TypeModule {
	private readonly _name: string;
	private readonly _description?: string;
	private readonly _content?: string;
	private readonly _videoSourceUrl?: string;
	private readonly _thumbnailUrl: string;
	private readonly _publicationDate: Date;
	private readonly _published: boolean;
	private readonly _courses?: string[];
	private readonly _lessons?: string[];
	private readonly _subModules?: string[];
	private readonly _belongToModules?: string[];
	private readonly _tags?: TypeTags;

	constructor(module: TypeModule) {
		const {error} = moduleSchema.validate(module);

		if (error) {
			throw new CustomError('UNPROCESSABLE_ENTITY', `Invalid module data: ${error.message}`);
		}

		this._name = module.name;
		this._description = module.description;
		this._content = module.content;
		this._videoSourceUrl = module.videoSourceUrl;
		this._thumbnailUrl = module.thumbnailUrl;
		this._publicationDate = module.publicationDate;
		this._published = module.published;
		this._courses = module.courses;
		this._lessons = module.lessons;
		this._subModules = module.subModules;
		this._belongToModules = module.belongToModules;
		this._tags = module.tags;
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

	get courses() {
		return this._courses;
	}

	get lessons() {
		return this._lessons;
	}

	get subModules() {
		return this._subModules;
	}

	get belongToModules() {
		return this._belongToModules;
	}

	get tags() {
		return this._tags;
	}
}
