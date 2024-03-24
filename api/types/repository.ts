export type TRepository<T> = {
	[x: string]: any;
	getAll(): Promise<T[]>;
};
