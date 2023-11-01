import express from 'express';
import { Request as JwtRequest, expressjwt } from 'express-jwt';
import { JWT_SECRET } from '../config';
import { handleErrorsMiddleware } from '../middlewares/handle-errors';
import { requireJwtToken } from '../middlewares/require-jwt-token';
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
    // FIX doublons auth/token in request
    const token = req.auth;
    if (!token) return next();
    req.token = token as any;
    return next();
  },
);

router.use('/auth', authRoutes);
router.use('/users', requireJwtToken, usersRoutes);
router.use('/tags', requireJwtToken, tagsRoutes);

router.use(handleErrorsMiddleware);

export default router;
