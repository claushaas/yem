import {type ISearchService, type SearchableEntity} from '#/types/ISearchService';
import Fuse, {type IFuseOptions} from 'fuse.js';

export class FuzzySearchEngine implements ISearchService.Engine<SearchableEntity> {
	async searchItemsByTerm(term: string, items: SearchableEntity[]) {
		const options: IFuseOptions<SearchableEntity> = {
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
