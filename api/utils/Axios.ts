import axios, {type AxiosResponse, type AxiosInstance} from 'axios';

export class Request {
	private readonly _request: AxiosInstance;

	constructor(baseUrl: string, headers: Record<string, string> = {}) {
		this._request = axios.create({
			// eslint-disable-next-line @typescript-eslint/naming-convention
			baseURL: baseUrl,
			headers,
		});
	}

	public async get(url: string, params: Record<string, string> = {}): Promise<AxiosResponse> {
		return this._request.get(url, {params});
	}

	public async post(
		url: string,
		data: unknown = {},
	): Promise<AxiosResponse> {
		return this._request.post(url, data);
	}

	public async put(url: string, data: Record<string, string> = {}): Promise<AxiosResponse> {
		return this._request.put(url, data);
	}

	public async delete(url: string): Promise<unknown> {
		return this._request.delete(url);
	}

	public async patch(url: string, data: Record<string, string> = {}): Promise<AxiosResponse> {
		return this._request.patch(url, data);
	}
}
