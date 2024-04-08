// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class MemoryCache {
	static get(key: string) {
		const value = MemoryCache.cache[key];

		if (value === undefined) {
			return null;
		}

		return value;
	}

	static set(key: string, value: string) {
		if (!value || value === '') {
			return;
		}

		MemoryCache.cache[key] = value;
	}

	static del(key: string) {
		if (MemoryCache.cache[key] === undefined) {
			return;
		}

		delete MemoryCache.cache[key]; // eslint-disable-line @typescript-eslint/no-dynamic-delete
	}

	static keys() {
		return Object.keys(MemoryCache.cache);
	}

	private static cache: Record<string, string> = {};
}
