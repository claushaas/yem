import {type TypeRepository} from './IRepository';

export type SearchableEntity = {
	name: string;
	description: string | undefined;
	tags?: string[];
};

export type TypeSearchService<T> = {
	searchByTerm(term: string): Promise<T[]>;
};

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace InSearchService {
	export type Engine<T> = {
		searchItemsByTerm(term: string, items: T[]): Promise<T[]>;
	};

	export type Repository<T> = TypeRepository<T>;
}
