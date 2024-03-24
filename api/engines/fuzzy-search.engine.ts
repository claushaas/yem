import Fuse, {type IFuseOptions} from 'fuse.js';
import {type ISearchService, type TSearchableEntity} from '../types/search-service.js';

export class FuzzySearchEngine implements ISearchService.TEngine<TSearchableEntity> {
	async searchItemsByTerm(term: string, items: TSearchableEntity[]) {
		const options: IFuseOptions<TSearchableEntity> = {
			includeScore: true,
			shouldSort: true,
			isCaseSensitive: false,
			threshold: 0.3,
			minMatchCharLength: 1,
			keys: ['name', 'description'],
		};

		const fuse = new Fuse(items, options);

		return fuse.search(term).map(result => result.item);
	}
}
