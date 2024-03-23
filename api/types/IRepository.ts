export type TRepository<T> = {
	getAll(): Promise<T[]>;
};
