import express from 'express';
import { omit } from 'lodash';
import { requireMinRole } from '../middlewares/require-min-role';
import { User, UserRole } from '../models/User';
import { UserCreateInputSchema, UserUpdateInputSchema } from '../schemas/User';
import { userService } from '../services/UserService';
import { HttpException } from '../utils/HttpException';

const router = express.Router();

function renderUser(user: User) {
  return omit(user, ['encryptedPassword']);
}

router.get('/', requireMinRole(UserRole.ADMIN), async function (req, res) {
  const dbUsers = await userService.findAll({
    page: Number(req.query.page) || 1,
    perPage: Number(req.query.perPage),
  });
  return res
    .status(200)
    .json({ data: dbUsers.map(renderUser) })
    .end();
});

router.get('/:id', async function (req, res, next) {
  // Check if asking for another user than the requesting one && is not admin
  if (req.params.id !== 'me' && (req.token?.role || 0) < UserRole.ADMIN) {
    return next(new HttpException(403, 'Forbidden', 'Not sufficient permissions'));
  }
  const id = req.params.id === 'me' ? req.token.sub || '' : req.params.id;
  try {
    const dbUser = await userService.findOne(id);
    return res
      .status(200)
      .json({ data: renderUser(dbUser) })
      .end();
  } catch (err) {
    return next(err);
  }
});

router.post('/', requireMinRole(UserRole.ADMIN), async function (req, res, next) {
  const result = await UserCreateInputSchema.safeParseAsync(req.body);
  if (!result.success) {
    return next(result.error);
  }
  try {
    const dbUser = await userService.create(result.data);
    return res
      .status(201)
      .json({ data: renderUser(dbUser) })
      .end();
  } catch (err) {
    return next(err);
  }
});

router.patch('/:id', requireMinRole(UserRole.ADMIN), async function (req, res, next) {
  const result = await UserUpdateInputSchema.safeParseAsync(req.body);
  if (!result.success) {
    return next(result.error);
  }
  try {
    const dbUser = await userService.update(req.params.id, result.data);
    return res
      .status(200)
      .json({ data: renderUser(dbUser) })
      .end();
  } catch (err) {
    return next(err);
  }
});

router.delete('/:id', requireMinRole(UserRole.ADMIN), async function (req, res, next) {
  try {
    const isDeleted = await userService.delete(req.params.id);
    if (!isDeleted) {
      throw new HttpException(404, 'Not found');
    }
    return res.status(200).json({}).end();
  } catch (err) {
    return next(err);
  }
});

export default router;
