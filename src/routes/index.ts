import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import express, { NextFunction, Request, Response } from 'express';
import { Request as JwtRequest, expressjwt } from 'express-jwt';
import { ZodError } from 'zod';
import { JWT_SECRET } from '../config';
import { HttpException } from '../libs/HttpException';
import { privateRoute } from '../middlewares/private-route';
import { prisma } from '../prisma';
import authRoutes from './auth';
import tagsRoutes from './tags';
import usersRoutes from './users';

const router = express.Router();

router.use(
  expressjwt({
    secret: JWT_SECRET,
    algorithms: ['HS256'],
    credentialsRequired: false,
  }),
  async function (req: JwtRequest, res, next) {
    const userId = req.auth?.sub;
    if (!userId) {
      next();
      return;
    }
    req.context.user = await prisma.user.findUnique({
      where: { id: req.auth?.sub },
    });
    next();
  },
);

router.use('/auth', authRoutes);

router.use('/users', privateRoute, usersRoutes);
router.use('/tags', privateRoute, tagsRoutes);

router.use(function (err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof HttpException) {
    res
      .status(err.code)
      .json({
        error: err,
      })
      .end();
    return;
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
    return;
  }
  if (err instanceof PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        res
          .status(400)
          .json({
            error: {
              code: 400,
              message: 'Bad Request',
              details: err,
            },
          })
          .end();
        return;
      case 'P2025':
        if (err.meta?.cause === 'Record to delete does not exist.') {
          res
            .status(404)
            .json({
              error: {
                code: 404,
                message: 'Not Found',
              },
            })
            .end();
          return;
        }
        break;
      default:
    }
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
});

export default router;
