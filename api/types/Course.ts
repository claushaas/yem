import {type TypeTags} from './Tag.js';

type TypeCourse = {
	name: string;
	description?: string;
	content?: string;
	roles: string[];
	videoSourceUrl?: string;
	thumbnailUrl: string;
	publicationDate: Date;
	published: boolean;
	tags?: TypeTags;
};

export default TypeCourse;