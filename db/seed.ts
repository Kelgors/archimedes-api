import fs from 'node:fs/promises';
import '../src/config';
import { AppDataSource } from '../src/db';
import { Bookmark } from '../src/models/Bookmark';
import { List } from '../src/models/List';
import { ListPermission } from '../src/models/ListPermission';
import { Tag } from '../src/models/Tag';
import { User } from '../src/models/User';

async function main() {
  const seedFilename = `seed.${process.env.NODE_ENV || 'development'}.json`;
  await AppDataSource.initialize();

  console.log('Loading %s', seedFilename);
  const seedFileContent = await fs.readFile(__dirname + `/${seedFilename}`);
  const data = JSON.parse(seedFileContent.toString('utf-8'));

  console.log(`Start seeding ...`);
  for (let index = 0; index < data.users.length; index++) {
    console.log('+ User(email: %s)', data.users[index].email);
    await AppDataSource.getRepository(User).insert(data.users[index]);
  }

  for (let index = 0; index < data.lists.length; index++) {
    console.log('+ List(name: %s)', data.lists[index].name);
    await AppDataSource.getRepository(List).insert(data.lists[index]);
  }

  for (let index = 0; index < data.permissions.length; index++) {
    console.log('+ ListPermission');
    await AppDataSource.getRepository(ListPermission).insert(data.permissions[index]);
  }

  for (let index = 0; index < data.tags.length; index++) {
    console.log('+ Tag(name: %s)', data.tags[index].name);
    await AppDataSource.getRepository(Tag).insert(data.tags[index]);
  }

  for (let index = 0; index < data.bookmarks.length; index++) {
    console.log('+ Bookmark(title: %s)', data.bookmarks[index].title);
    await AppDataSource.getRepository(Bookmark).insert(data.bookmarks[index]);
  }

  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await AppDataSource.destroy();
  })

  .catch(async (e) => {
    console.error(e);
    await AppDataSource.destroy();
    process.exit(1);
  });
