import type TypeCourse from '../types/Course';

export default class Course implements TypeCourse {
	private _name: string;
	private readonly _description?: string;
	private readonly _content?: string;
	private readonly _roles: string[];
	private readonly _videoSourceUrl?: string;
	private readonly _thumbnailUrl: string;
	private readonly _publicationDate: Date;
	private readonly _published: boolean;

	constructor(course: TypeCourse) {
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

	setName(name: string) {
		(this._name = name);
	}
}
