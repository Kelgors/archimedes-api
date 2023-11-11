import type { ObjectLiteral } from 'typeorm';

export type FindAllOptions<AddOn = unknown> = {
  page?: number;
  perPage?: number;
} & AddOn;

export interface ICrudService<Model extends ObjectLiteral, ZodCreateInput, ZodUpdateInput> {
  findAll(options?: FindAllOptions): Promise<Model[]>;
  findOne(id: Model['id']): Promise<Model>;
  create(input: ZodCreateInput): Promise<Model>;
  update(item: Model, input: ZodUpdateInput): Promise<Model>;
  delete(item: Model): Promise<Model>;
}
