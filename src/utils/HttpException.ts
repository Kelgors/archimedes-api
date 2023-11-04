import { z } from 'zod';

export class HttpException {
  constructor(
    public readonly code: number,
    public readonly message?: string,
    public readonly details?: unknown,
  ) {}
}

export const HttpExceptionSchema = z.object({
  code: z.number(),
  message: z.string(),
  details: z.record(z.any()).optional(),
});

export type HttpExceptionResponse = z.infer<typeof HttpExceptionSchema>;
