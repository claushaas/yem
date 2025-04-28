import { type Prisma } from '@prisma/client';

export type TTag = [string, string];

export type TTags = TTag[];

export type TPrismaPayloadCreateTag = Prisma.TagOptionTagValueGetPayload<{
	select: {
		id: true;
		tagOptionName: true;
		tagValueName: true;
		published: true;
		createdAt: true;
		updatedAt: true;
	};
}>;

export type TPrismaPayloadGetAllTags = TPrismaPayloadCreateTag[];
