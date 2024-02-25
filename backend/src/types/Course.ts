import type Role from './Role';

type Course = {
	name: string;
	description?: string;
	content?: string;
	roles: Role[];
	videoSourceUrl?: string;
	thumbnailUrl: string;
	publicationDate: Date;
	published: boolean;
};

export default Course;
