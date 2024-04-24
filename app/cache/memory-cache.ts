/* eslint-disable @typescript-eslint/no-dynamic-delete */
/* eslint-disable @typescript-eslint/no-extraneous-class */
/* eslint-disable @typescript-eslint/consistent-type-assertions */

import {remember} from '@epic-web/remember';

class MemoryCache {
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

		delete MemoryCache.cache[key];
	}

	static keys() {
		return Object.keys(MemoryCache.cache);
	}

	static clear() {
		for (const key of Object.keys(MemoryCache.cache)) {
			delete MemoryCache.cache[key];
		}
	}

	private static readonly cache = {} as Record<string, string>;
}

export const memoryCache = remember('memoryCache', () => MemoryCache);
