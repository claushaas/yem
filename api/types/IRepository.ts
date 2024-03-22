export type IRepository<T> = {
  getAll(): Promise<T[]>
}