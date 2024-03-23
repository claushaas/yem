import {type TTags} from './Tag.js';

export type TCourse = {
	name: string;
	description?: string;
	content?: string;
	roles: string[];
	videoSourceUrl?: string;
	thumbnailUrl: string;
	publicationDate: Date;
	published: boolean;
	tags?: TTags;
};
