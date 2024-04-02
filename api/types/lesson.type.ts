import {type Prisma} from '@prisma/client';
import {type TTags} from './tag.type.js';
import {type TUuid} from './uuid.type.js';

export type TLessonType = 'video' | 'text' | 'courseWare';

export type TLesson = {
	name: string;
	type: TLessonType;
	description?: string;
	content?: string;
	videoSourceUrl?: string;
	duration?: number;
	thumbnailUrl: string;
	modules: TUuid[];
	publicationDate: Date;
	published: boolean;
	tags?: TTags;
};

export type TPrismaPayloadCreateLesson = Prisma.LessonGetPayload<{
	include: {
		modules: true;
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

export type TPrismaPayloadUpdateLesson = TPrismaPayloadCreateLesson;

export type TPrismaPayloadGetLessonList = Array<Prisma.LessonGetPayload<{
	select: {
		id: true;
		name: true;
		type: true;
		description: true;
		thumbnailUrl: true;
		duration: true;
		publicationDate: true;
		published: true;
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
		lessonProgress: true | false;
	};
}>>;

export type TPrismaPayloadGetLessonById = Prisma.LessonGetPayload<{
	select: {
		id: true;
		name: true;
		type: true;
		description: true;
		content: true;
		videoSourceUrl: true;
		duration: true;
		thumbnailUrl: true;
		publicationDate: true;
		published: true;
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
		comments: {
			select: {
				id: true;
				content: true;
				createdAt: true;
				userId: true;
				published: true;
				responses: {
					select: {
						id: true;
						content: true;
						createdAt: true;
						userId: true;
						published: true;
					};
				};
			};
		};
		lessonProgress: true;
	};
}>;
