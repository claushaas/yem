import {Request} from '../utils/Axios';
import CustomError from '../utils/CustomError';
import {type TypeServiceReturn} from '../types/ServiceReturn';
import {type AxiosResponse} from 'axios';
import {type TypeMauticUserCreationAttributes} from '../types/User';
import {logger} from '../utils/Logger';

export class MauticService {
	private readonly _request: Request;

	constructor() {
		this._request = new Request(process.env.MAUTIC_API_URL!, {
			'Content-Type': 'application/json',
			// eslint-disable-next-line @typescript-eslint/naming-convention
			Authorization: `Basic ${Buffer.from(`${process.env.MAUTIC_API_USERNAME}:${process.env.MAUTIC_API_PASSWORD}`).toString('base64')}`,
		});
	}

	public async createContact(user: TypeMauticUserCreationAttributes): Promise<TypeServiceReturn<{
		contact: {
			id: string;
		};
	}>> {
		const url = '/contacts/new';
		const data = {
			email: user.email,
			firstname: user.firstName,
			lastname: user.lastName,
		};

		try {
			const response = await this._request.post(url, data) as {
				data: {
					contact: {
						id: string;
					};
				};
			};

			return {
				status: 'CREATED',
				data: response.data,
			};
		} catch (error) {
			logger.logError(`Error creating contact for ${user.email}: ${(error as Error).message}`);
			throw new CustomError('INVALID_DATA', `Error creating contact for ${user.email}`);
		}
	}

	public async addContactToSegment(contactId: string, segmentId: number): Promise<TypeServiceReturn<unknown>> {
		const url = `/segments/${segmentId}/contact/${contactId}/add`;

		try {
			await this._request.post(url);

			return {
				status: 'NO_CONTENT',
				data: null,
			};
		} catch (error) {
			logger.logError(`Error adding contact ${contactId} to segment ${segmentId}: ${(error as Error).message}`);
			throw new CustomError('INVALID_DATA', `Error adding contact ${contactId} to segment ${segmentId}`);
		}
	}

	public async updateContact(email: string, data: Record<string, string>): Promise<TypeServiceReturn<unknown>> {
		const response = await this._getContactIdByEmail(email);
		const contactId = response.data;

		const url = `/contacts/${contactId}/edit`;

		try {
			await this._request.patch(url, data);

			return {
				status: 'NO_CONTENT',
				data: null,
			};
		} catch (error) {
			logger.logError(`Error updating contact ${contactId}: ${(error as Error).message}`);
			throw new CustomError('INVALID_DATA', `Error updating contact ${contactId}`);
		}
	}

	public async deleteContact(email: string): Promise<TypeServiceReturn<unknown>> {
		const response = await this._getContactIdByEmail(email);
		const contactId = response.data;

		const url = `/contacts/${contactId}/delete`;

		try {
			await this._request.delete(url);

			return {
				status: 'NO_CONTENT',
				data: null,
			};
		} catch (error) {
			logger.logError(`Error deleting contact ${contactId}: ${(error as Error).message}`);
			throw new CustomError('INVALID_DATA', `Error deleting contact ${contactId}`);
		}
	}

	public async addToDoNotContactList(email: string): Promise<TypeServiceReturn<unknown>> {
		const response = await this._getContactIdByEmail(email);
		const contactId = response.data;

		const url = `/contacts/${contactId}/dnc/email/add`;

		try {
			await this._request.post(url);

			return {
				status: 'NO_CONTENT',
				data: null,
			};
		} catch (error) {
			logger.logError(`Error adding contact ${contactId} to do not contact list: ${(error as Error).message}`);
			throw new CustomError('INVALID_DATA', `Error adding contact ${contactId} to do not contact list`);
		}
	}

	public async removeFromDoNotContactList(email: string): Promise<TypeServiceReturn<unknown>> {
		const response = await this._getContactIdByEmail(email);
		const contactId = response.data;

		const url = `/contacts/${contactId}/dnc/email/remove`;

		try {
			await this._request.post(url);

			return {
				status: 'NO_CONTENT',
				data: null,
			};
		} catch (error) {
			logger.logError(`Error removing contact ${contactId} from do not contact list: ${(error as Error).message}`);
			throw new CustomError('INVALID_DATA', `Error removing contact ${contactId} from do not contact list`);
		}
	}

	private async _getContactIdByEmail(email: string): Promise<TypeServiceReturn<string>> {
		const url = '/contacts';
		const params = {
			// eslint-disable-next-line @typescript-eslint/naming-convention
			'where[0][col]': 'email',
			// eslint-disable-next-line @typescript-eslint/naming-convention
			'where[0][expr]': 'in',
			// eslint-disable-next-line @typescript-eslint/naming-convention
			'where[0][val]': email,
		};

		try {
			const response = await this._request.get(url, params);

			const contactId = Object.keys(response.data.contacts as Record<string, any>)[0];

			return {
				status: 'SUCCESSFUL',
				data: contactId,
			};
		} catch (error) {
			logger.logError(`Error getting contact by email ${email}: ${(error as Error).message}`);
			throw new CustomError('INVALID_DATA', `Error getting contact by email ${email}`);
		}
	}
}
