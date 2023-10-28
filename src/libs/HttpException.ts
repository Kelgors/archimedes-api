export class HttpException {
  constructor(public readonly code: number, public readonly message: string, public readonly details?: unknown) {}
}
