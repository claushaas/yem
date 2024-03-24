import {type TTags} from './tag.js';
import {type TUuid} from './uuid.js';

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
