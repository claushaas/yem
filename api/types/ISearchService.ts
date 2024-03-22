import {type IRepository} from './IRepository';

export type SearchableEntity = {
	name: string;
	description: string | null;
	tags?: string[];
};

export type ISearchService<T> = {
	searchByTerm(term: string): Promise<T[]>;
};

export namespace ISearchService {
	export type Engine<T> = {
		searchItemsByTerm(term: string, items: T[]): Promise<T[]>;
	};

	export type Repository<T> = IRepository<T>;
}
