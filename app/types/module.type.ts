import {type Prisma} from '@prisma/client';
import {type TTags} from './tag.type.js';

export type TModule = {
	oldId?: string;
	name: string;
	description?: string;
	content?: string;
	marketingContent?: string;
	videoSourceUrl?: string;
	marketingVideoUrl?: string;
	thumbnailUrl: string;
	publicationDate: Date;
	published: boolean;
	courses?: string[];
	lessons?: string[];
	tags?: TTags;
	isLessonsOrderRandom: boolean;
};

export type TModules = TModule[];

export type TPrismaPayloadCreateOrUpdateModule = Prisma.ModuleGetPayload<{
	include: {
		course: true;
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

export type TPrismaPayloadGetModulesList = Array<Prisma.ModuleGetPayload<{
	select: {
		id: true;
		name: true;
		slug: true;
	};
}>>;

export type TPrismaPayloadGetModuleById = Prisma.ModuleGetPayload<{
	include: {
		lessons: {
			select: {
				id: true;
				name: true;
				slug: true;
				description: true;
				thumbnailUrl: true;
				published: true;
				publicationDate: true;
				lessonProgress: true;
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
}>;
