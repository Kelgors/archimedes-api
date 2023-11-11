import type { BookmarkOutput } from '../../../src/schemas/Bookmark';

type BookmarkOuputWithoutId = Omit<BookmarkOutput, 'id'>;

export function expectBookmark(input: BookmarkOuputWithoutId, ref: BookmarkOuputWithoutId) {
  expect(input).toHaveProperty('title');
  expect(input.title).toBe(ref.title);
  if ('description' in ref) {
    expect(input).toHaveProperty('description');
    expect(input.description).toBe(ref.description);
  }
  expect(input).toHaveProperty('url');
  expect(input.url).toBe(ref.url);
  if ('listIds' in ref) {
    expect(input).toHaveProperty('listIds');
    expect(new Set(input.listIds || [])).toEqual(new Set(ref.listIds || []));
  }
  if ('tagIds' in ref) {
    expect(input).toHaveProperty('tagIds');
    expect(new Set(input.tagIds || [])).toEqual(new Set(ref.tagIds || []));
  }
}

export function expectBookmarks(input: BookmarkOutput[], ref: BookmarkOutput[]) {
  expect(input).toHaveLength(ref.length);
  const sortedInput = input.slice().sort((a, b) => a.id.localeCompare(b.id));
  const sortedRef = ref.slice().sort((a, b) => a.id.localeCompare(b.id));
  sortedRef.forEach((item, index) => expectBookmark(sortedInput[index], item));
}
