import {type TRepository} from './repository.js';

export type TSearchableEntity = {
	name: string;
	description: string | undefined;
	tags?: string[];
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
