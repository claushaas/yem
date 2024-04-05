import {type Prisma} from '@prisma/client';
import {type TTags} from './tag.type.js';

export type TCourse = {
	name: string;
	description?: string;
	content?: string;
	videoSourceUrl?: string;
	thumbnailUrl: string;
	publicationDate: Date;
	published: boolean;
	isSelling: boolean;
	tags?: TTags;
};

export type TPrismaPayloadGetAllCourses = Array<Prisma.CourseGetPayload<{
	select: {
		id: true;
		name: true;
		slug: true;
		description: true;
		thumbnailUrl: true;
		published: true;
		publicationDate: true;
	};
}>>;

export type TPrismaPayloadGetCourseById = Prisma.CourseGetPayload<{
	include: {
		modules: {
			select: {
				id: true;
				name: true;
				slug: true;
				description: true;
				thumbnailUrl: true;
				published: true;
				publicationDate: true;
			};
		};
		comments: {
			select: {
				id: true;
				content: true;
				createdAt: true;
				userId: true;
				responses: {
					select: {
						id: true;
						content: true;
						createdAt: true;
						userId: true;
					};
				};
			};
		};
	};
}>;

export type TPrismaPayloadCreateCourse = Prisma.CourseGetPayload<{
	include: {
		tags: {
			include: {
				tagOption: {
					select: {
						name: true;
					};
				};
				tagValue: {
					select: {
						name: true;
					};
				};
			};
		};
	};
}>;

export type TPrismaPayloadUpdateCourse = TPrismaPayloadCreateCourse;
