import type { Prisma } from '@prisma/client';

export type TCourse = {
	oldId?: string;
	name: string;
	description: string;
	order?: number;
	content?: string;
	marketingContent?: string;
	videoSourceUrl?: string;
	marketingVideoUrl?: string;
	thumbnailUrl: string;
	publicationDate: Date;
	isPublished: boolean;
	isSelling: boolean;
	delegateAuthTo?: string[];
};

export type TPrismaPayloadGetAllCourses = Array<
	Prisma.CourseGetPayload<{
		select: {
			id: true;
			name: true;
			slug: true;
			order: true;
			description: true;
			thumbnailUrl: true;
			publicationDate: true;
			isPublished: true;
			isSelling: true;
		};
	}>
>;

export type TPrismaPayloadGetCourseBySlug = Prisma.CourseGetPayload<{
	include: {
		modules: {
			select: {
				id: true;
				order: true;
				isPublished: true;
				publicationDate: true;
				module: {
					select: {
						id: true;
						slug: true;
						name: true;
						description: true;
						thumbnailUrl: true;
					};
				};
			};
		};
		delegateAuthTo: {
			select: {
				id: true;
				slug: true;
				name: true;
				subscriptions: true;
			};
		};
		comments: {
			include: {
				responses: true;
			};
		};
	};
}>;

export type TPrismaPayloadCreateOrUpdateCourse =
	Prisma.CourseGetPayload<undefined>;
