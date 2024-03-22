import CustomError from '../utils/CustomError';
import {type InSearchService, type SearchableEntity} from '../types/ISearchService';
import {logger} from '../utils/Logger';

export default class SearchService {
	constructor(private readonly repository: InSearchService.Repository<SearchableEntity>, private readonly engine: InSearchService.Engine<SearchableEntity>) {}

	async searchByTerm(term: string) {
		const items = await this.repository.getAll();

		if (!items || items.length === 0) {
			throw new CustomError('UNPROCESSABLE_ENTITY', 'No items to search in');
		}

		try {
			return await this.engine.searchItemsByTerm(term, items);
		} catch (e) {
			logger.logError((e as Error).message);
			throw new CustomError('UNPROCESSABLE_ENTITY', `search engine could not complete the search task for the term: ${term}`);
		}
	}
}
