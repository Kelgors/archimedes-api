import express from 'express';
import { getRepository } from '../db';
import { Tag } from '../models/Tag';
import { HttpException } from '../utils/HttpException';

const router = express.Router();

router.get('/', async function (req, res) {
  const userId = req.token?.sub || '';
  const dbTags = await getRepository(Tag).find({
    where: {
      bookmarks: {
        lists: {
          permissions: {
            userId,
          },
        },
      },
    },
  });
  return res
    .status(200)
    .json({
      data: dbTags,
    })
    .end();
});

router.get('/:id', async function (req, res, next) {
  const userId = req.token?.sub || '';
  const dbTag = await getRepository(Tag).findOne({
    where: {
      id: req.params.id,
    },
  });
  if (!dbTag) {
    return next(new HttpException(404, 'Not Found'));
  }
  return res
    .status(200)
    .json({
      data: dbTag,
    })
    .end();
});

export default router;
