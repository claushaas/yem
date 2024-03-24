import {type TTags} from './tag.type.js';

export type TCourse = {
	name: string;
	description?: string;
	content?: string;
	videoSourceUrl?: string;
	thumbnailUrl: string;
	publicationDate: Date;
	published: boolean;
	tags?: TTags;
};
