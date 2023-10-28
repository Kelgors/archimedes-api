import { User } from '@prisma/client';
import express from 'express';
import { omit } from 'lodash';
import { HttpException } from '../HttpException';
import { minRole } from '../middlewares/min-role';
import { prisma } from '../prisma';
import { UserCreateInputParser } from '../schemas/User';
import { encryptPassword } from '../services/password-encryption';

const router = express.Router();

function renderUser(dbUser: User | null) {
  return omit(dbUser, ['encryptedPassword']);
}

router.get('/', minRole(1000), async function (req, res) {
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
  if (req.params.id !== 'me' && (req.context.user?.role || 0) < 1000) {
    next(new HttpException(403, 'Forbidden', 'Not sufficient permissions'));
    return;
  }
  const id = req.params.id === 'me' ? req.context.user?.id || '' : req.params.id;
  const dbUser = await prisma.user.findUnique({
    where: { id },
  });
  if (!dbUser) {
    next(new HttpException(404, 'Not Found'));
    return;
  }
  res
    .status(200)
    .json({
      data: renderUser(dbUser),
    })
    .end();
});

router.post('/', async function (req, res) {
  const body = await UserCreateInputParser.parseAsync(req.body);
  const dbUser = await prisma.user.create({
    data: {
      email: body.email,
      name: body.name,
      role: body.role,
      encryptedPassword: await encryptPassword(body.password),
    },
  });
  res.status(201).json(renderUser(dbUser)).end();
});

export default router;
