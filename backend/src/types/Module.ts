import {type TypeTags} from './Tag';
import {type TypeUuid} from './UUID';

export type TypeModule = {
	name: string;
	description?: string;
	content?: string;
	videoSourceUrl?: string;
	thumbnailUrl: string;
	publicationDate: Date;
	published: boolean;
	courses?: TypeUuid[];
	lessons?: TypeUuid[];
	subModules?: TypeUuid[];
	belongToModules?: TypeUuid[];
	tags?: TypeTags;
	// Comments?: string[];
};

export type TypeModules = TypeModule[];
