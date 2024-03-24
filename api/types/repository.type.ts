import {type TSearchableEntity} from './search-service.type.js';

export type TRepository<T> = {
	[x: string]: any;
	getAll(): Promise<T[]>;
	searchItemsByTerm?(term: string, items: TSearchableEntity[]): Promise<T[]>;
};
