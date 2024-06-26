import {type Prisma} from '@prisma/client';
import {type TTags} from './tag.type.js';

export type TLessonType = 'video' | 'text' | 'courseWare';

export type TLesson = {
	oldId?: string;
	name: string;
	description: string;
	type: TLessonType;
	content?: string;
	marketingContent?: string;
	videoSourceUrl?: string;
	marketingVideoUrl?: string;
	duration?: number;
	thumbnailUrl: string;
	modules?: string[];
	tags?: TTags;
	order?: number;
	isPublished?: boolean;
	publicationDate?: Date;
};

export type TPrismaPayloadCreateOrUpdateLesson = Prisma.LessonGetPayload<undefined>;

export type TPrismaPayloadGetLessonList = Array<Prisma.LessonGetPayload<{
	select: {
		id: true;
		slug: true;
		name: true;
		type: true;
		description: true;
		thumbnailUrl: true;
		duration: true;
		tags: true;
		modules: {
			select: {
				isPublished: true;
				publicationDate: true;
				module: {
					select: {
						id: true;
						slug: true;
						courses: {
							select: {
								course: {
									select: {
										id: true;
										slug: true;
									};
								};
							};
						};
					};
				};
			};
		};
	};
}>>;

export type TPrismaPayloadGetLessonById = Prisma.LessonToModuleGetPayload<{
	include: {
		module: {
			select: {
				courses: {
					select: {
						course: {
							select: {
								delegateAuthTo: {
									select: {
										id: true;
										subscriptions: true;
									};
								};
							};
						};
					};
				};
			};
		};
		lesson: {
			include: {
				tags: true;
				comments: {
					include: {
						responses: true;
					};
				};
				completedBy: true;
				SavedBy: true;
				FavoritedBy: true;
			};
		};
	};
}>;
