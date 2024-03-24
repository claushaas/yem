import {type TTags} from './tag.js';
import {type TUuid} from './uuid.js';

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
