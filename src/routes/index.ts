import express, { NextFunction, Request, Response } from 'express';
import { Request as JwtRequest, expressjwt } from 'express-jwt';
import { ZodError } from 'zod';
import { HttpException } from '../HttpException';
import { JWT_SECRET } from '../config';
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
});

export default router;
