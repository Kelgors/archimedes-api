import { ObjectLiteral } from 'typeorm';

export type FindAllOptions = {
  page?: number;
  perPage?: number;
};

export interface ICrudService<Model extends ObjectLiteral, ZodCreateInput, ZodUpdateInput> {
  findAll(options?: FindAllOptions): Promise<Model[]>;
  findOne(id: Model['id']): Promise<Model>;
  create(input: ZodCreateInput): Promise<Model>;
  update(id: Model['id'], input: ZodUpdateInput): Promise<Model>;
  delete(id: Model['id']): Promise<boolean>;
}
