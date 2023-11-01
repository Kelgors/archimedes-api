import { onErrorAsyncHookHandler } from 'fastify';
import { HttpException } from '../utils/HttpException';

function transformErrorToHttpException(error: unknown): HttpException | null {
  return null;
}

const onError: onErrorAsyncHookHandler = async function (error, req, reply) {};

export default onError;
/*
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
*/
