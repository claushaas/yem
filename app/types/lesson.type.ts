import {type Prisma} from '@prisma/client';
import {type TTags} from './tag.type.js';

export type TLessonType = 'video' | 'text' | 'courseWare';

export type TLesson = {
	oldId?: string;
	name: string;
	type: TLessonType;
	description?: string;
	content?: string;
	marketingContent?: string;
	videoSourceUrl?: string;
	marketingVideoUrl?: string;
	duration?: number;
	thumbnailUrl: string;
	modules: string[];
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
		slug: true;
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
		modules: {
			select: {
				id: true;
				name: true;
				slug: true;
				course: {
					select: {
						id: true;
						name: true;
						slug: true;
						delegateAuthTo: {
							select: {
								id: true;
								name: true;
								slug: true;
								subscriptions: true;
							};
						};
					};
				};
			};
		};
	};
}>;
