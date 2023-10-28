export class HttpException {
  public code: number;
  public message: string;
  public details: unknown;

  constructor(code: number, message: string, details?: unknown) {
    this.code = code;
    this.message = message;
    this.details = details;
  }
}
