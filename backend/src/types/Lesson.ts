import {type TypeTags} from './Tag';
import {type TypeUuid} from './UUID';

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
