import type { Prisma } from '@prisma/client';
import type { TLessonDataForCache } from '~/cache/populate-lessons-to-cache.js';
import type { TModuleToCourse } from '~/cache/populate-modules-to-cache.js';

export type TModule = {
	oldId?: string;
	name: string;
	description: string;
	content?: string;
	marketingContent?: string;
	videoSourceUrl?: string;
	marketingVideoUrl?: string;
	thumbnailUrl: string;
	courses?: string[];
	isLessonsOrderRandom: boolean;
	showTagsFilters: boolean;
	order?: number;
	isPublished?: boolean;
	publicationDate?: Date;
};

export type TModules = TModule[];

export type TPrismaPayloadCreateOrUpdateModule = Prisma.ModuleGetPayload<{
	include: {
		courses: {
			include: {
				course: true;
			};
		};
	};
}>;

export type TPrismaPayloadGetModulesList = Array<
	Prisma.ModuleGetPayload<{
		select: {
			id: true;
			name: true;
			slug: true;
		};
	}>
>;

export type TPrismaPayloadGetModuleBySlug = Prisma.ModuleToCourseGetPayload<{
	include: {
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
		module: {
			include: {
				lessons: {
					include: {
						lesson: {
							select: {
								id: true;
								name: true;
								slug: true;
								description: true;
								thumbnailUrl: true;
								tags: true;
							};
						};
					};
				};
				comments: {
					include: {
						responses: true;
					};
				};
			};
		};
	};
}>;

export type TModuleDataFromCache = {
	lessons: string[] | TLessonDataForCache[];
	delegateAuthTo: string[];
	pages: number;
} & TModuleToCourse;
