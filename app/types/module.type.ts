import {type Prisma} from '@prisma/client';
import {type TTags} from './tag.type.js';
import {type TUuid} from './uuid.type.js';

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
	tags?: TTags;
};

export type TModules = TModule[];

export type TPrismaPayloadCreateModule = Prisma.ModuleGetPayload<{
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

export type TPrismaPayloadUpdateModule = TPrismaPayloadCreateModule;

export type TPrismaPayloadGetModulesList = Array<Prisma.ModuleGetPayload<{
	select: {
		id: true;
		name: true;
		slug: true;
		description: true;
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
				subscriptions: true;
			};
		};
	};
}>;
