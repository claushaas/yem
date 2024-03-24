import {type TRepository} from './repository.type.js';

export type TSearchableEntity = {
	id: string;
	name: string;
	description: string | undefined;
	tags?: string[];
	thumbnailUrl: string;
	published: boolean;
	publicationDate: Date;
};

export type TSearchService<T> = {
	searchByTerm(term: string): Promise<T[]>;
};

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ISearchService {
	export type TEngine<T> = {
		searchItemsByTerm(term: string, items: T[]): Promise<T[]>;
	};

	export type TTypeRepository<T> = TRepository<T>;
}
