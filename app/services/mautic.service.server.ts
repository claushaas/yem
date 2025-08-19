/** biome-ignore-all lint/style/noNonNullAssertion: . */
import { MauticUserForCreation } from '../entities/user.entity.server.js';
import type { TServiceReturn } from '../types/service-return.type.js';
import type { TMauticUserCreationAttributes } from '../types/user.type.js';
import { CustomError } from '../utils/custom-error.js';
import { logger } from '../utils/logger.util.js';
import { Request } from '../utils/request.js';

export class MauticService {
	private readonly _request: Request;

	constructor() {
		const username = process.env.MAUTIC_API_USERNAME ?? '';
		const password = process.env.MAUTIC_API_PASSWORD ?? '';
		const credentials = `${username}:${password}`;
		const base64Credentials = Buffer.from(credentials).toString('base64');
		this._request = new Request(process.env.MAUTIC_API_URL!, {
			Authorization: `Basic ${base64Credentials}`, // eslint-disable-line @typescript-eslint/naming-convention
			'Content-Type': 'application/json',
		});
	}

	public async createContact(user: TMauticUserCreationAttributes): Promise<
		TServiceReturn<{
			contact: {
				id: string;
			};
		}>
	> {
		const validatedUser = new MauticUserForCreation(user);

		const url = '/contacts/new';
		const data = {
			email: validatedUser.email,
			firstname: validatedUser.firstName,
			lastname: validatedUser.lastName,
		};

		try {
			const response = (await this._request.post(url, data)) as {
				data: {
					contact: {
						id: string;
					};
				};
			};

			return {
				data: response.data,
				status: 'CREATED',
			};
		} catch (error) {
			logger.logError(
				`Error creating contact for ${user.email}: ${(error as Error).message}`,
			);
			throw new CustomError(
				'INVALID_DATA',
				`Error creating contact for ${user.email}`,
			);
		}
	}

	public async addContactToSegment(
		contactId: string,
		segmentId: number,
	): Promise<TServiceReturn<string>> {
		const url = `/segments/${segmentId}/contact/${contactId}/add`;

		try {
			await this._request.post(url);

			return {
				data: 'Contact added to segment successfully',
				status: 'NO_CONTENT',
			};
		} catch (error) {
			logger.logError(
				`Error adding contact ${contactId} to segment ${segmentId}: ${(error as Error).message}`,
			);
			throw new CustomError(
				'INVALID_DATA',
				`Error adding contact ${contactId} to segment ${segmentId}`,
			);
		}
	}

	public async addContactToSegmentByEmail(
		email: string,
		segmentId: number,
	): Promise<TServiceReturn<string>> {
		const response = await this._getContactIdByEmail(email);
		const contactId = response.data;

		const url = `/segments/${segmentId}/contact/${contactId}/add`;

		try {
			await this._request.post(url);

			return {
				data: 'Contact added to segment successfully',
				status: 'NO_CONTENT',
			};
		} catch (error) {
			logger.logError(
				`Error adding contact ${contactId} to segment ${segmentId}: ${(error as Error).message}`,
			);
			throw new CustomError(
				'INVALID_DATA',
				`Error adding contact ${contactId} to segment ${segmentId}`,
			);
		}
	}

	public async updateContact(
		email: string,
		data: Partial<TMauticUserCreationAttributes>,
	): Promise<TServiceReturn<string>> {
		logger.logDebug(`Updating contact ${email}`);
		const response = await this._getContactIdByEmail(email);
		const contactId = response.data;
		logger.logDebug(`Contact ${email} has id ${contactId}`);

		const url = `/contacts/${contactId}/edit`;

		try {
			await this._request.patch(url, data);

			return {
				data: 'Contact updated successfully',
				status: 'NO_CONTENT',
			};
		} catch (error) {
			logger.logError(
				`Error updating contact ${contactId}: ${(error as Error).message}`,
			);
			throw new CustomError(
				'INVALID_DATA',
				`Error updating contact ${contactId}`,
			);
		}
	}

	public async deleteContact(email: string): Promise<TServiceReturn<string>> {
		const response = await this._getContactIdByEmail(email);
		const contactId = response.data;

		const url = `/contacts/${contactId}/delete`;

		try {
			await this._request.delete(url);

			return {
				data: `User ${email} deleted successfully`,
				status: 'SUCCESSFUL',
			};
		} catch (error) {
			logger.logError(
				`Error deleting contact ${contactId}: ${(error as Error).message}`,
			);
			throw new CustomError(
				'INVALID_DATA',
				`Error deleting contact ${contactId}`,
			);
		}
	}

	public async addToDoNotContactList(
		email: string,
	): Promise<TServiceReturn<string>> {
		const response = await this._getContactIdByEmail(email);
		const contactId = response.data;

		const url = `/contacts/${contactId}/dnc/email/add`;

		try {
			await this._request.post(url);

			return {
				data: 'Contact added to do not contact list successfully',
				status: 'NO_CONTENT',
			};
		} catch (error) {
			logger.logError(
				`Error adding contact ${contactId} to do not contact list: ${(error as Error).message}`,
			);
			throw new CustomError(
				'INVALID_DATA',
				`Error adding contact ${contactId} to do not contact list`,
			);
		}
	}

	public async removeFromDoNotContactList(
		email: string,
	): Promise<TServiceReturn<string>> {
		const response = await this._getContactIdByEmail(email);
		const contactId = response.data;

		const url = `/contacts/${contactId}/dnc/email/remove`;

		try {
			await this._request.post(url);

			return {
				data: 'Contact removed from do not contact list successfully',
				status: 'NO_CONTENT',
			};
		} catch (error) {
			logger.logError(
				`Error removing contact ${contactId} from do not contact list: ${(error as Error).message}`,
			);
			throw new CustomError(
				'INVALID_DATA',
				`Error removing contact ${contactId} from do not contact list`,
			);
		}
	}

	private async _getContactIdByEmail(
		email: string,
	): Promise<TServiceReturn<string>> {
		const url = '/contacts';
		const parameters = {
			// eslint-disable-next-line @typescript-eslint/naming-convention
			'where[0][col]': 'email',
			// eslint-disable-next-line @typescript-eslint/naming-convention
			'where[0][expr]': 'in',
			// eslint-disable-next-line @typescript-eslint/naming-convention
			'where[0][val]': email,
		};

		try {
			const response = await this._request.get(url, parameters);

			const contactId = Object.keys(
				response.data.contacts as Record<string, Record<string, unknown>>,
			)[0];

			return {
				data: contactId,
				status: 'SUCCESSFUL',
			};
		} catch (error) {
			logger.logError(
				`Error getting contact by email ${email}: ${(error as Error).message}`,
			);
			throw new CustomError(
				'INVALID_DATA',
				`Error getting contact by email ${email}`,
			);
		}
	}
}
