import { Tag } from '@prisma/client';
import express from 'express';
import { HttpException } from '../HttpException';
import { prisma } from '../prisma';

const router = express.Router();

function renderTag(tag: Tag) {
  return tag;
}

router.get('/', async function (req, res) {
  const userId = req.context.user?.id || '';
  const dbTags = await prisma.tag.findMany({
    where: { ownerId: userId },
  });
  res
    .status(200)
    .json({
      data: dbTags.map(renderTag),
    })
    .end();
});

router.get('/:id', async function (req, res, next) {
  const userId = req.context.user?.id || '';
  const dbTag = await prisma.tag.findUnique({
    where: { ownerId: userId, id: req.params.id },
  });
  if (!dbTag) {
    next(new HttpException(404, 'Not Found'));
    return;
  }
  res
    .status(200)
    .json({
      data: renderTag(dbTag),
    })
    .end();
});

export default router;
