export enum AppErrorCode {
  WRONG_EMAIL_OR_PASSWORD = 'WRONG_EMAIL_OR_PASSWORD',
  MISSING_PERMISSIONS = 'MISSING_PERMISSIONS',

  LIST_MISS_WRITE_PERM = 'LIST_MISS_WRITE_PERM',
  LIST_MUST_BE_OWNER = 'LIST_MUST_BE_OWNER',
  UNSUPPORTED_ERROR = 'UNSUPPORTED_ERROR',
}

export class AppError {
  constructor(
    public readonly code: AppErrorCode,
    public readonly message?: string,
    public readonly details?: unknown,
  ) {}
}
