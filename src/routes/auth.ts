import express from 'express';
import jwt from 'jsonwebtoken';
import { HttpException } from '../HttpException';
import { JWT_SECRET } from '../config';
import { verifyPassword } from '../libs/password-encryption';
import { prisma } from '../prisma';
import { AuthSigninParser } from '../schemas/Auth';

const router = express.Router();

router.post('/sign', async function (req, res, next) {
  const result = await AuthSigninParser.safeParseAsync(req.body);
  if (!result.success) {
    next(result.error);
    return;
  }
  const body = result.data;
  const dbUser = await prisma.user.findUnique({
    where: { email: body.email },
  });
  if (!dbUser) {
    next(new HttpException(404, 'User with email/password pair not found'));
    return;
  }
  const isPasswordCorrect = await verifyPassword(dbUser.encryptedPassword, body.password);
  if (!isPasswordCorrect) {
    next(new HttpException(404, 'User with email/password pair not found'));
    return;
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
