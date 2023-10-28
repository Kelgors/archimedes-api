import express from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';
import { HttpException } from '../libs/HttpException';
import { verifyPassword } from '../libs/password-encryption';
import { prisma } from '../prisma';
import { AuthSigninSchema } from '../schemas/Auth';

const router = express.Router();

router.post('/sign', async function (req, res, next) {
  const result = await AuthSigninSchema.safeParseAsync(req.body);
  if (!result.success) {
    return next(result.error);
  }
  const body = result.data;
  const dbUser = await prisma.user.findUnique({
    where: { email: body.email },
  });
  if (!dbUser) {
    return next(new HttpException(404, 'User with email/password pair not found'));
  }
  const isPasswordCorrect = await verifyPassword(dbUser.encryptedPassword, body.password);
  if (!isPasswordCorrect) {
    return next(new HttpException(404, 'User with email/password pair not found'));
  }
  const token = jwt.sign(
    {
      sub: dbUser.id,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 /* 1 week */,
    },
    JWT_SECRET,
    {
      algorithm: 'HS256',
    },
  );
  res
    .status(201)
    .json({
      token,
    })
    .end();
});

export default router;
