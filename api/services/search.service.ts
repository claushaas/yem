import {CustomError} from '../utils/custom-error.js';
import {type ISearchService, type TSearchableEntity} from '../types/search-service.js';
import {logger} from '../utils/logger.js';

export default class SearchService {
	[x: string]: any;
	constructor(private readonly repository: ISearchService.TTypeRepository<TSearchableEntity>, private readonly engine: ISearchService.TTypeRepository<TSearchableEntity>) {}

	async searchByTerm(term: string) {
		const items = await this.repository.getAll();

		if (!items || items.length === 0) {
			throw new CustomError('UNPROCESSABLE_ENTITY', 'No items to search in');
		}

		try {
			const result = await this.searchItemsByTerm(term, items); // eslint-disable-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
			return result; // eslint-disable-line @typescript-eslint/no-unsafe-return
		} catch (error) {
			logger.logError((error as Error).message);
			throw new CustomError('UNPROCESSABLE_ENTITY', `search engine could not complete the search task for the term: ${term}`);
		}
	}
}
