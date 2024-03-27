/* eslint-disable import/no-mutable-exports */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable unicorn/prevent-abbreviations */
/* eslint-disable @typescript-eslint/naming-convention */
import {PrismaClient} from '@prisma/client';

let db: PrismaClient;

type TGlobal = typeof globalThis & {
	__db: PrismaClient;
};

declare global {
	let __database: PrismaClient | undefined;
}

// This is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
if (process.env.NODE_ENV === 'production') {
	db = new PrismaClient();
	db.$connect();
} else {
	if (!(global as TGlobal).__db) {
		(global as TGlobal).__db = new PrismaClient();
		(global as TGlobal).__db.$connect();
	}

	db = (global as TGlobal).__db;
}

export {db};
