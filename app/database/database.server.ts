/* eslint-disable @typescript-eslint/no-floating-promises */
import { remember } from '@epic-web/remember';
import { PrismaClient } from '@prisma/client/index.js';

export const database = remember('db', () => {
	const client = new PrismaClient();
	client.$connect();
	return client;
});
