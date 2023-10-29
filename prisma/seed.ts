import { PrismaClient } from '@prisma/client';
import fs from 'node:fs/promises';
import '../src/config';
import { SeedFileSchema } from './seed.schema';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);
  const seedFilename = `seed.${process.env.NODE_ENV || 'development'}.json`;
  console.log('Loading %s', seedFilename);
  const seedFileContent = await fs.readFile(__dirname + `/${seedFilename}`);
  const data = await SeedFileSchema.parseAsync(JSON.parse(seedFileContent.toString('utf-8')));

  for (let index = 0; index < data.users.length; index++) {
    console.log('+ User(email: %s)', data.users[index].email);
    await prisma.user.create({
      data: data.users[index],
    });
  }

  for (let index = 0; index < data.lists.length; index++) {
    console.log('+ List(name: %s)', data.lists[index].name);
    await prisma.list.create({
      data: data.lists[index],
    });
  }

  for (let index = 0; index < data.permissions.length; index++) {
    console.log('+ ListPermission');
    await prisma.listPermission.create({
      data: data.permissions[index],
    });
  }

  for (let index = 0; index < data.tags.length; index++) {
    console.log('+ Tag(name: %s)', data.tags[index].name);
    await prisma.tag.create({
      data: data.tags[index],
    });
  }

  for (let index = 0; index < data.bookmarks.length; index++) {
    console.log('+ Bookmark(title: %s)', data.bookmarks[index].title);
    await prisma.bookmark.create({
      data: data.bookmarks[index],
    });
  }

  for (let index = 0; index < data.tagOnBookmarks.length; index++) {
    console.log('+ TagOnBookmark');
    await prisma.tagOnBookmark.create({
      data: data.tagOnBookmarks[index],
    });
  }

  for (let index = 0; index < data.bookmarkOnLists.length; index++) {
    console.log('+ BookmarkOnList');
    await prisma.bookmarkOnList.create({
      data: data.bookmarkOnLists[index],
    });
  }

  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })

  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
