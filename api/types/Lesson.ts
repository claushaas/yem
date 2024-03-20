import {type TypeTags} from './Tag.js';
import {type TypeUuid} from './UUID.js';

export type TypeLessonType = 'video' | 'text' | 'courseWare';

export type TypeLesson = {
	name: string;
	type: TypeLessonType;
	description?: string;
	content?: string;
	videoSourceUrl?: string;
	thumbnailUrl: string;
	modules: TypeUuid[];
	publicationDate: Date;
	published: boolean;
	tags?: TypeTags;
};
