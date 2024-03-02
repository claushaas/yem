import {Request} from '../utils/Axios';
import CustomError from '../utils/CustomError';
import {type TypeServiceReturn} from '../types/ServiceReturn';
import {SecretService} from './secret.service';
import {type TypeSecret} from '../types/Secret';

const baseUrl = process.env.HOTMART_API_URL ?? 'https://sandbox.hotmart.com/';

export class HotmartService {
	private readonly _request: Request;
	private _accessToken: string;
	private readonly _secretService: SecretService;

	constructor(accessToken: string) {
		this._secretService = new SecretService();
		this._accessToken = accessToken;
		this._request = new Request(baseUrl, {
			'Content-Type': 'application/json',
			// eslint-disable-next-line @typescript-eslint/naming-convention
			Authorization: `Bearer ${this._accessToken}`,
		});
	}

	public async getUserSubscriptions(userEmail: string): Promise<TypeServiceReturn<unknown>> {
		const url = '/payments/api/v1/subscriptions';
		const params = {
			// eslint-disable-next-line @typescript-eslint/naming-convention
			subscriber_email: userEmail,
		};

		try {
			const response = await this._request.get(url, params);

			return {
				status: 'SUCCESSFUL',
				data: response.data,
			};
		} catch (error) {
			try {
				await this._getAccessToken();

				const response = await this._request.get(url, params);

				return {
					status: 'SUCCESSFUL',
					data: response.data,
				};
			} catch (error) {
				throw new CustomError('INVALID_DATA', (error as Error).message);
			}
		}
	}

	private setAccessToken(accessToken: string): void {
		this._accessToken = accessToken;
	}

	private async _getAccessToken(): Promise<string> {
		try {
			const {data: secrets} = await this._secretService.getSecret();

			const request = new Request('https://api-sec-vlc.hotmart.com', {
				'Content-Type': 'application/json',
				// eslint-disable-next-line @typescript-eslint/naming-convention
				Authorization: `Basic ${secrets.hotmartApiClientBasic}`,
			});

			const response = await request.post({
				url: 'https://api-sec-vlc.hotmart.com/security/oauth/token?grant_type=client_credentials',
				params: {
					// eslint-disable-next-line @typescript-eslint/naming-convention
					client_id: secrets.hotmartApiClientId,
					// eslint-disable-next-line @typescript-eslint/naming-convention
					client_secret: secrets.hotmartApiClientSecret,
				},
			});

			await this._secretService.setSecret({
				...secrets,
				hotmartApiAccessToken: response.data.access_token as string,
			});

			this.setAccessToken(response.data.access_token as string);

			return response.data.access_token as string;
		} catch (error) {
			throw new CustomError('INVALID_DATA', (error as Error).message);
		}
	}
}
