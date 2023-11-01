import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/ApplicationError';
import { HttpException } from '../utils/HttpException';
import { transformSqlError } from '../utils/handle-sql-errors';

export function handleErrorsMiddleware(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof AppError) {
    err = err.toHttpException();
  }
  if (err instanceof HttpException) {
    res
      .status(err.code)
      .json({
        error: err,
      })
      .end();
    return next();
  }
  if (err instanceof ZodError) {
    res
      .status(400)
      .json({
        error: {
          code: 400,
          message: 'Bad Request',
          details: err.issues,
        },
      })
      .end();
    return next();
  }
  const sqlHttpException = transformSqlError(err);
  if (sqlHttpException) {
    res
      .status(sqlHttpException.code)
      .json({
        error: sqlHttpException,
      })
      .end();
    return next();
  }
  res
    .status(500)
    .json({
      error: {
        code: 500,
        message: 'Internal Error',
        details: err,
      },
    })
    .end();
  return next();
}
