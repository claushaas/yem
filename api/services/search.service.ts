import {CustomError} from '../utils/custom-error.js';
import {type ISearchService, type TSearchableEntity} from '../types/search-service.type.js';

export default class SearchService {
	constructor(private readonly repository: ISearchService.TTypeRepository<TSearchableEntity>, private readonly engine: ISearchService.TEngine<TSearchableEntity>) {}

	async searchByTerm(term: string) {
		const items = await this.repository.getAll();

		if (!items || items.length === 0) {
			throw new CustomError('UNPROCESSABLE_ENTITY', 'No items to search in');
		}

		try {
			return await this.engine.searchItemsByTerm(term, items);
		} catch (error) {
			console.error((error as Error).message); // TODO send to logs
			throw new CustomError('UNPROCESSABLE_ENTITY', `search engine could not complete the search task for the term: ${term}`);
		}
	}
}
