import express from 'express';
import { omit } from 'lodash';
import { getRepository } from '../db';
import { HttpException } from '../libs/HttpException';
import { minRole } from '../middlewares/min-role';
import { User, UserRole } from '../models/User';
import { UserCreateInputSchema, UserUpdateInputSchema } from '../schemas/User';
import { passwordEncryptionService } from '../services/PasswordEncryptionService';

const router = express.Router();

router.get('/', minRole(UserRole.ADMIN), async function (req, res) {
  const LIMIT = 20;
  const page = (Number(req.query.page) || 1) - 1;
  const dbUsers = await getRepository(User).find({
    skip: page * LIMIT,
    take: LIMIT,
  });
  return res
    .status(200)
    .json({
      data: dbUsers,
    })
    .end();
});

router.get('/:id', async function (req, res, next) {
  // Check if asking for another user than the requesting one && is not admin
  if (req.params.id !== 'me' && (req.token?.role || 0) < UserRole.ADMIN) {
    return next(new HttpException(403, 'Forbidden', 'Not sufficient permissions'));
  }
  const id = req.params.id === 'me' ? req.token?.sub || '' : req.params.id;
  const dbUser = await getRepository(User).findOne({
    where: { id },
  });
  if (!dbUser) {
    return next(new HttpException(404, 'Not Found'));
  }
  return res
    .status(200)
    .json({
      data: dbUser,
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
    const dbUser = await getRepository(User).save({
      email: body.email,
      name: body.name,
      role: body.role,
      encryptedPassword: await passwordEncryptionService.encryptPassword(body.password),
    });
    return res.status(201).json({ data: dbUser }).end();
  } catch (err) {
    return next(err);
  }
});

router.patch('/:id', minRole(UserRole.ADMIN), async function (req, res, next) {
  const result = await UserUpdateInputSchema.safeParseAsync(req.body);
  if (!result.success) {
    return next(result.error);
  }
  const body = result.data;
  try {
    const dbOriginalUser = await getRepository(User).findOneOrFail({
      where: { id: req.params.id },
    });
    const dbPayload = Object.assign({}, dbOriginalUser, omit(body, ['password']));
    if (body.password) {
      dbPayload.encryptedPassword = await passwordEncryptionService.encryptPassword(body.password);
    }
    const dbUser = await getRepository(User).save(dbPayload);
    return res.status(200).json({ data: dbUser }).end();
  } catch (err) {
    return next(err);
  }
});

router.delete('/:id', minRole(UserRole.ADMIN), async function (req, res, next) {
  try {
    const deleteResult = await getRepository(User).delete({
      id: req.params.id,
    });
    if ((deleteResult.affected || 0) === 0) {
      throw new HttpException(404, 'Not found');
    }
    return res.status(200).json({}).end();
  } catch (err) {
    return next(err);
  }
});

export default router;
