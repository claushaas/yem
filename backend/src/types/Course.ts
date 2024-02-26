type TypeCourse = {
	name: string;
	description?: string;
	content?: string;
	roles: string[];
	videoSourceUrl?: string;
	thumbnailUrl: string;
	publicationDate: Date;
	published: boolean;
};

export default TypeCourse;
