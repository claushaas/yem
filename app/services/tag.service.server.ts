import {type Prisma, type PrismaClient} from '@prisma/client';
import {type TServiceReturn} from '../types/service-return.type.js';
import {logger} from '../utils/logger.util.js';
import {db} from '../database/db.js';
import {type TPrismaPayloadGetAllTags, type TPrismaPayloadCreateTag, type TTag} from '~/types/tag.type.js';
import {CustomError} from '~/utils/custom-error.js';

type test = Prisma.TagOptionTagValueCreateArgs;

export class TagService {
	private readonly _model: PrismaClient;

	constructor(model: PrismaClient = db) {
		this._model = model;
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
}
