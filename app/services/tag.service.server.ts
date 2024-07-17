import {type PrismaClient} from '@prisma/client';
import {type TServiceReturn} from '../types/service-return.type.js';
import {logger} from '../utils/logger.util.js';
import {database} from '../database/database.server.js';
import {type TPrismaPayloadGetAllTags, type TPrismaPayloadCreateTag, type TTag} from '~/types/tag.type.js';
import {CustomError} from '~/utils/custom-error.js';
import {memoryCache} from '~/cache/memory-cache.js';

export class TagService {
	private static cache: typeof memoryCache;
	private readonly _model: PrismaClient;

	constructor(model: PrismaClient = database) {
		this._model = model;
		TagService.cache = memoryCache;
	}

	public async create(tagData: TTag): Promise<TServiceReturn<TPrismaPayloadCreateTag>> {
		try {
			const createdTag = await this._model.tagOptionTagValue.create({
				data: {
					tagOption: {
						connectOrCreate: {
							where: {
								name: tagData[0],
							},
							create: {
								name: tagData[0],
							},
						},
					},
					tagValue: {
						connectOrCreate: {
							where: {
								name: tagData[1],
							},
							create: {
								name: tagData[1],
							},
						},
					},
				},
			});

			return {
				status: 'SUCCESSFUL',
				data: createdTag,
			};
		} catch (error) {
			logger.logError(`Error creating tag: ${(error as Error).message}`);
			throw new CustomError('UNKNOWN', `Error creating tag: ${(error as Error).message}`);
		}
	}

	public async getAll(): Promise<TServiceReturn<TPrismaPayloadGetAllTags>> {
		try {
			const tags = await this._model.tagOptionTagValue.findMany();

			return {
				status: 'SUCCESSFUL',
				data: tags,
			};
		} catch (error) {
			logger.logError(`Error getting all tags: ${(error as Error).message}`);
			throw new CustomError('UNKNOWN', `Error getting all tags: ${(error as Error).message}`);
		}
	}

	public getTagsFromCache(): TServiceReturn<Array<{tagOption: string; tagValues: string[]}> | undefined> {
		const tagsFromCache = TagService.cache.get('tags');

		if (!tagsFromCache) {
			return {
				status: 'NO_CONTENT',
				data: undefined,
			};
		}

		const parsedTags = JSON.parse(tagsFromCache) as Array<{tagOption: string; tagValue: string}>;

		const tags = [];

		for (const tag of parsedTags) {
			const tagIndex = tags.findIndex(({tagOption, tagValues}) => tagOption === tag.tagOption && tagValues.includes(tag.tagValue));

			if (tagIndex === -1) {
				tags.push({tagOption: tag.tagOption, tagValues: [tag.tagValue]});
			} else {
				tags[tagIndex].tagValues.push(tag.tagValue);
			}
		}

		return {
			status: 'SUCCESSFUL',
			data: tags,
		};
	}
}
