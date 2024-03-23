import {type TTags} from './Tag.js';
import {type TUuid} from './UUID.js';

export type TLessonType = 'video' | 'text' | 'courseWare';

export type TLesson = {
	name: string;
	type: TLessonType;
	description?: string;
	content?: string;
	videoSourceUrl?: string;
	thumbnailUrl: string;
	modules: TUuid[];
	publicationDate: Date;
	published: boolean;
	tags?: TTags;
};
