import type { PrismaClient } from '@prisma/client';
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
	private readonly _model: PrismaClient;

	constructor(model: PrismaClient = database) {
		this._model = model;
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

	public async getAllOrganised(): Promise<
		TServiceReturn<
			Array<{ tagOption: string; tagValues: string[] }> | undefined
		>
	> {
		try {
			const tags = await this._model.tagOptionTagValue.findMany();

			const organizedTags = [];

			for (const tag of tags) {
				const tagIndex = organizedTags.findIndex(
					({ tagOption }) => tagOption === tag.tagOptionName,
				);

				if (tagIndex === -1) {
					organizedTags.push({
						tagOption: tag.tagOptionName,
						tagValues: [tag.tagValueName],
					});
				} else if (
					!organizedTags[tagIndex].tagValues.includes(tag.tagValueName)
				) {
					organizedTags[tagIndex].tagValues.push(tag.tagValueName);
				}
			}

			return {
				data: organizedTags,
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
}
