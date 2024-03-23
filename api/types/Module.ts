import {type TTags} from './Tag.js';
import {type TUuid} from './UUID.js';

export type TModule = {
	name: string;
	description?: string;
	content?: string;
	videoSourceUrl?: string;
	thumbnailUrl: string;
	publicationDate: Date;
	published: boolean;
	courses?: TUuid[];
	lessons?: TUuid[];
	subModules?: TUuid[];
	belongToModules?: TUuid[];
	tags?: TTags;
	// Comments?: string[];
};

export type TModules = TModule[];
