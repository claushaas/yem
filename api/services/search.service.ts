import CustomError from '#/utils/CustomError';
import {type ISearchService, type SearchableEntity} from '#/types/ISearchService';

export default class SearchService implements ISearchService<SearchableEntity> {
	constructor(private readonly repository: ISearchService.Repository<SearchableEntity>, private readonly engine: ISearchService.Engine<SearchableEntity>) {}

	async searchByTerm(term: string) {
		const items = await this.repository.getAll();

		if (!items || items.length === 0) {
			throw new CustomError('UNPROCESSABLE_ENTITY', 'No items to search in');
		}

		try {
			return await this.engine.searchItemsByTerm(term, items);
		} catch (e) {
			console.error((e as Error).message); // TODO send to logs
			throw new CustomError('UNPROCESSABLE_ENTITY', `search engine could not complete the search task for the term: ${term}`);
		}
	}
}
