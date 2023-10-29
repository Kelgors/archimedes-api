import express from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';
import { getRepository } from '../db';
import { HttpException } from '../libs/HttpException';
import { User } from '../models/User';
import { AuthSignSchema, Token } from '../schemas/Auth';
import { passwordEncryptionService } from '../services/PasswordEncryptionService';

const router = express.Router();

router.post('/sign', async function (req, res, next) {
  const result = await AuthSignSchema.safeParseAsync(req.body);
  if (!result.success) {
    return next(result.error);
  }
  const body = result.data;
  const dbUser = await getRepository(User).findOne({
    where: { email: body.email },
  });
  if (!dbUser) {
    return next(new HttpException(404, 'User with email/password pair not found'));
  }
  const isPasswordCorrect = await passwordEncryptionService.verifyPassword(dbUser.encryptedPassword, body.password);
  if (!isPasswordCorrect) {
    return next(new HttpException(404, 'User with email/password pair not found'));
  }
  const token = jwt.sign(
    {
      sub: dbUser.id,
      role: dbUser.role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 /* 1 week */,
    } satisfies Token,
    JWT_SECRET,
    {
      algorithm: 'HS256',
    },
  );
  return res
    .status(201)
    .json({
      token,
    })
    .end();
});

export default router;
