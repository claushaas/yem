export type TypeRepository<T> = {
	getAll(): Promise<T[]>;
};
