import { User } from '@prisma/client';
import express from 'express';
import { omit } from 'lodash';
import { HttpException } from '../libs/HttpException';
import { encryptPassword } from '../libs/password-encryption';
import { minRole } from '../middlewares/min-role';
import { prisma } from '../prisma';
import { UserCreateInputSchema, UserRole, UserUpdateSchema } from '../schemas/User';

const router = express.Router();

function renderUser(dbUser: User | null) {
  return omit(dbUser, ['encryptedPassword']);
}

router.get('/', minRole(UserRole.ADMIN), async function (req, res) {
  const LIMIT = 20;
  const page = (Number(req.query.page) || 1) - 1;
  const dbUsers = await prisma.user.findMany({
    skip: page * LIMIT,
    take: LIMIT,
  });
  res
    .status(200)
    .json({
      data: dbUsers.map(renderUser),
    })
    .end();
});

router.get('/:id', async function (req, res, next) {
  // Check if asking for another user than the requesting one && is not admin
  if (req.params.id !== 'me' && (req.context.user?.role || 0) < UserRole.ADMIN) {
    return next(new HttpException(403, 'Forbidden', 'Not sufficient permissions'));
  }
  const id = req.params.id === 'me' ? req.context.user?.id || '' : req.params.id;
  const dbUser = await prisma.user.findUnique({
    where: { id },
  });
  if (!dbUser) {
    return next(new HttpException(404, 'Not Found'));
  }
  res
    .status(200)
    .json({
      data: renderUser(dbUser),
    })
    .end();
});

router.post('/', minRole(UserRole.ADMIN), async function (req, res, next) {
  const result = await UserCreateInputSchema.safeParseAsync(req.body);
  if (!result.success) {
    return next(result.error);
  }
  const body = result.data;
  try {
    const dbUser = await prisma.user.create({
      data: {
        email: body.email,
        name: body.name,
        role: body.role,
        encryptedPassword: await encryptPassword(body.password),
      },
    });
    res
      .status(201)
      .json({ data: renderUser(dbUser) })
      .end();
  } catch (err) {
    return next(err);
  }
});

router.patch('/:id', minRole(UserRole.ADMIN), async function (req, res, next) {
  const result = await UserUpdateSchema.safeParseAsync(req.body);
  if (!result.success) {
    return next(result.error);
  }
  const body = result.data;
  try {
    const dbUser = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        email: body.email,
        name: body.name,
        role: body.role,
        encryptedPassword: body.password ? await encryptPassword(body.password) : undefined,
      },
    });
    res
      .status(200)
      .json({ data: renderUser(dbUser) })
      .end();
  } catch (err) {
    return next(err);
  }
});

export default router;
