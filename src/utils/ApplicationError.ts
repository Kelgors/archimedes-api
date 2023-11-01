import { HttpException } from './HttpException';

export enum AppErrorCode {
  WRONG_EMAIL_OR_PASSWORD,
}

const APP_HTTP_ERRNO_MAPPING = {
  [AppErrorCode.WRONG_EMAIL_OR_PASSWORD]: 404,
};

export class AppError {
  constructor(public readonly code: AppErrorCode, public readonly message: string, public readonly details?: unknown) {}

  toHttpException() {
    return new HttpException(APP_HTTP_ERRNO_MAPPING[this.code], this.message, this);
  }
}
