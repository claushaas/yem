import type { PrismaClient } from '@prisma/client';
import { memoryCache } from '~/cache/memory-cache.js';
import type {
	TPrismaPayloadCreateTag,
	TPrismaPayloadGetAllTags,
	TTag,
} from '~/types/tag.type.js';
import { CustomError } from '~/utils/custom-error.js';
import { database } from '../database/database.server.js';
import type { TServiceReturn } from '../types/service-return.type.js';
import { logger } from '../utils/logger.util.js';

export class TagService {
	private static cache: typeof memoryCache;
	private readonly _model: PrismaClient;

	constructor(model: PrismaClient = database) {
		this._model = model;
		TagService.cache = memoryCache;
	}

	public async create(
		tagData: TTag,
	): Promise<TServiceReturn<TPrismaPayloadCreateTag>> {
		try {
			const createdTag = await this._model.tagOptionTagValue.create({
				data: {
					tagOption: {
						connectOrCreate: {
							create: {
								name: tagData[0],
							},
							where: {
								name: tagData[0],
							},
						},
					},
					tagValue: {
						connectOrCreate: {
							create: {
								name: tagData[1],
							},
							where: {
								name: tagData[1],
							},
						},
					},
				},
			});

			return {
				data: createdTag,
				status: 'SUCCESSFUL',
			};
		} catch (error) {
			logger.logError(`Error creating tag: ${(error as Error).message}`);
			throw new CustomError(
				'UNKNOWN',
				`Error creating tag: ${(error as Error).message}`,
			);
		}
	}

	public async getAll(): Promise<TServiceReturn<TPrismaPayloadGetAllTags>> {
		try {
			const tags = await this._model.tagOptionTagValue.findMany();

			return {
				data: tags,
				status: 'SUCCESSFUL',
			};
		} catch (error) {
			logger.logError(`Error getting all tags: ${(error as Error).message}`);
			throw new CustomError(
				'UNKNOWN',
				`Error getting all tags: ${(error as Error).message}`,
			);
		}
	}

	public getTagsFromCache(): TServiceReturn<
		Array<{ tagOption: string; tagValues: string[] }> | undefined
	> {
		const tagsFromCache = TagService.cache.get('tags');

		if (!tagsFromCache) {
			return {
				data: undefined,
				status: 'NO_CONTENT',
			};
		}

		const parsedTags = JSON.parse(tagsFromCache) as Array<{
			tagOption: string;
			tagValue: string;
		}>;

		const tags = [];

		for (const tag of parsedTags) {
			const tagIndex = tags.findIndex(
				({ tagOption }) => tagOption === tag.tagOption,
			);

			if (tagIndex === -1) {
				tags.push({ tagOption: tag.tagOption, tagValues: [tag.tagValue] });
			} else if (!tags[tagIndex].tagValues.includes(tag.tagValue)) {
				tags[tagIndex].tagValues.push(tag.tagValue);
			}
		}

		return {
			data: tags,
			status: 'SUCCESSFUL',
		};
	}
}
