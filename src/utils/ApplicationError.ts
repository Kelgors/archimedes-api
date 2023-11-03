export enum AppErrorCode {
  WRONG_EMAIL_OR_PASSWORD = 'WRONG_EMAIL_OR_PASSWORD',
  MISSING_PERMISSIONS = 'MISSING_PERMISSIONS',
}

export class AppError {
  constructor(
    public readonly code: AppErrorCode,
    public readonly message?: string,
    public readonly details?: unknown,
  ) {}
}
