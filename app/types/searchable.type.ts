export type TSearchableEntity = {
	id: string;
	name: string;
	description: string | null; // eslint-disable-line @typescript-eslint/ban-types
	tags?: Array<{tagOption: {name: string}; tagValue: {name: string}} & {id: string; tagOptionName: string; tagValueName: string; published: boolean; createdAt: Date; updatedAt: Date}>;
	thumbnailUrl: string;
	published: boolean;
	publicationDate: Date;
};
