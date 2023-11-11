import type { BookmarkOutput } from '../../../src/schemas/Bookmark';

export const DEFAULT_LIST_ID = 'a20beebc-b315-4cf2-9880-8765f0600d1a';
export const DEFAULT_TAG_CREATE = 'e101290e-a2ed-469f-b26e-6e312aa63c67';
export const DEFAULT_TAG_UPDATE = '7d6f9018-c4cf-4175-a420-828167277a0b';

export function mockBookmark(input: Partial<BookmarkOutput>): Omit<BookmarkOutput, 'id'> {
  return {
    title: 'bookmark-mock',
    description: null,
    url: 'https://example.com',
    listIds: [DEFAULT_LIST_ID],
    tagIds: [DEFAULT_TAG_CREATE],
    ...input,
  };
}

export function bookmarksPrivatePrivate(): BookmarkOutput[] {
  return [
    {
      id: '081bc68f-f2a3-45b6-bc1d-2bb4a22c4029',
      title: 'Bookmark(1)',
      description: 'Added in ins(PRIVATE),ano(PRIVATE)',
      url: 'https://example-1.test',
      listIds: ['4e7f6619-2bd8-4e1a-ae0b-a56428eb4006'],
      tagIds: ['3f9df708-0e0a-4c69-9ed4-413cd16b99fd', '27a8f687-9915-47cb-8c8b-b9753f8da033'],
    },
    {
      id: '610f69a9-2cb0-4f15-9752-bfccb584c9ef',
      title: 'Bookmark(2)',
      description: 'Added in ins(PRIVATE),ano(PRIVATE)',
      url: 'https://example-2.test',
      listIds: ['4e7f6619-2bd8-4e1a-ae0b-a56428eb4006'],
      tagIds: [],
    },
  ];
}

export function bookmarksPrivateShared(): BookmarkOutput[] {
  return [
    {
      id: 'a3888641-48e6-4417-8476-416f83ea7702',
      title: 'Bookmark(3)',
      description: 'Added in ins(PRIVATE),ano(SHARED)',
      url: 'https://example-3.test',
      listIds: ['e2972c77-710e-4875-891d-1b73756f3fc5'],
      tagIds: ['6dbf72e8-76a5-4709-bb7a-a762b78ff4f3', 'b806c24f-d4f3-42f1-9d54-ab96452397a2'],
    },
    {
      id: '5b83cacf-4109-420a-9749-b7f245dc6db9',
      title: 'Bookmark(4)',
      description: 'Added in ins(PRIVATE),ano(SHARED)',
      url: 'https://example-4.test',
      listIds: ['e2972c77-710e-4875-891d-1b73756f3fc5'],
      tagIds: [],
    },
  ];
}

export function bookmarksPrivatePublic(): BookmarkOutput[] {
  return [
    {
      id: '86307953-fce7-40cf-afe3-a2aa57a261a6',
      title: 'Bookmark(5)',
      description: 'Added in ins(PRIVATE),ano(PUBLIC)',
      url: 'https://example-5.test',
      listIds: ['25895fa6-b1e4-4968-8ab1-f2b636dafc75'],
      tagIds: ['1ebc0808-d89a-482c-9161-bcea3b9e8756', '88fdb6cf-fa56-43df-877a-8e9d40c90c8c'],
    },
    {
      id: '4ce83e6d-bf08-4962-9915-570a869d3c6c',
      title: 'Bookmark(6)',
      description: 'Added in ins(PRIVATE),ano(PUBLIC)',
      url: 'https://example-6.test',
      listIds: ['25895fa6-b1e4-4968-8ab1-f2b636dafc75'],
      tagIds: [],
    },
  ];
}

export function bookmarksSharedPrivate(): BookmarkOutput[] {
  return [
    {
      id: '6fcf9f40-7e0c-4f6e-b8c2-c6f2dbfa6caf',
      title: 'Bookmark(7)',
      description: 'Added in ins(SHARED),ano(PRIVATE)',
      url: 'https://example-7.test',
      listIds: ['e1ad14e6-f189-47d1-989a-34723b6dccb4'],
      tagIds: ['ca7119a7-d875-42ae-ab73-d4d47e115bde', '8b9fe288-61ac-4bc3-9607-8ed7ef42a5ad'],
    },
    {
      id: '20c0f1a6-3a29-4565-adff-285fe7cf8c1b',
      title: 'Bookmark(8)',
      description: 'Added in ins(SHARED),ano(PRIVATE)',
      url: 'https://example-8.test',
      listIds: ['e1ad14e6-f189-47d1-989a-34723b6dccb4'],
      tagIds: [],
    },
  ];
}

export function bookmarksSharedShared(): BookmarkOutput[] {
  return [
    {
      id: '98a854dc-3399-47aa-98b8-dc292056b3b5',
      title: 'Bookmark(9)',
      description: 'Added in ins(SHARED),ano(SHARED)',
      url: 'https://example-9.test',
      listIds: ['82908b29-7f52-4065-8248-74320f356e29'],
      tagIds: ['064f3092-afeb-431f-b230-d8ea5a60cf96', 'd679d345-22d0-4920-8bde-eddc22905667'],
    },
    {
      id: 'e14c7e7d-d4a4-4e8f-9401-79d97972a7fb',
      title: 'Bookmark(10)',
      description: 'Added in ins(SHARED),ano(SHARED)',
      url: 'https://example-10.test',
      listIds: ['82908b29-7f52-4065-8248-74320f356e29'],
      tagIds: [],
    },
  ];
}

export function bookmarksSharedPublic(): BookmarkOutput[] {
  return [
    {
      id: '27b714de-5f26-443c-90af-741a343e2334',
      title: 'Bookmark(11)',
      description: 'Added in ins(SHARED),ano(PUBLIC)',
      url: 'https://example-11.test',
      listIds: ['22b6d444-2dae-4f55-967d-1e5bdeb91116'],
      tagIds: ['2fcda7c0-fa75-47a4-ae9e-ab1f04a24510', 'a2fbf2eb-b0d1-49f6-a30b-a4a268015369'],
    },
    {
      id: '9ff613d2-dda6-4386-9820-35a4c6cd6512',
      title: 'Bookmark(12)',
      description: 'Added in ins(SHARED),ano(PUBLIC)',
      url: 'https://example-12.test',
      listIds: ['22b6d444-2dae-4f55-967d-1e5bdeb91116'],
      tagIds: [],
    },
  ];
}

export function bookmarksPublicPrivate(): BookmarkOutput[] {
  return [
    {
      id: '6a89c959-345c-4de7-9a60-c944d04a8337',
      title: 'Bookmark(13)',
      description: 'Added in ins(PUBLIC),ano(PRIVATE)',
      url: 'https://example-13.test',
      listIds: ['09c67eb5-2910-4753-9bc6-7d7ab337f54b'],
      tagIds: ['39bc7711-2533-4cf2-bf59-a8bdf1f5894b', 'b7089cbe-6422-4dc5-b761-e7aedf60c42e'],
    },
    {
      id: 'fe506da6-d4a0-4209-a8f5-20019cc0657d',
      title: 'Bookmark(14)',
      description: 'Added in ins(PUBLIC),ano(PRIVATE)',
      url: 'https://example-14.test',
      listIds: ['09c67eb5-2910-4753-9bc6-7d7ab337f54b'],
      tagIds: [],
    },
  ];
}

export function bookmarksPublicShared(): BookmarkOutput[] {
  return [
    {
      id: '526758b1-122c-4381-a599-d0812420d3cf',
      title: 'Bookmark(15)',
      description: 'Added in ins(PUBLIC),ano(SHARED)',
      url: 'https://example-15.test',
      listIds: ['30a022e2-ee4e-4e73-a9c0-3571027dafdb'],
      tagIds: ['f1db0b0a-1b66-41c3-acf5-4cb44ef6cc8f', 'deafdb41-c305-4bd4-af51-4b40970a1c7e'],
    },
    {
      id: '4b2514d5-6627-49f2-b65c-5c223cfdce0c',
      title: 'Bookmark(16)',
      description: 'Added in ins(PUBLIC),ano(SHARED)',
      url: 'https://example-16.test',
      listIds: ['30a022e2-ee4e-4e73-a9c0-3571027dafdb'],
      tagIds: [],
    },
  ];
}

export function bookmarksPublicPublic(): BookmarkOutput[] {
  return [
    {
      id: '49c9d5ad-2f58-4571-85f8-b9559cbe9774',
      title: 'Bookmark(17)',
      description: 'Added in ins(PUBLIC),ano(PUBLIC)',
      url: 'https://example-17.test',
      listIds: ['ae98b1e8-7f46-47b5-af0a-957dffc45ef4'],
      tagIds: ['4b2fd757-eba5-4ece-81c0-5bdcd1882de4', 'e3f86321-075a-46a4-bd2a-d4d6bfed87cb'],
    },
    {
      id: '4b48d898-2641-4ed2-9a8c-81b465f50f07',
      title: 'Bookmark(18)',
      description: 'Added in ins(PUBLIC),ano(PUBLIC)',
      url: 'https://example-18.test',
      listIds: ['ae98b1e8-7f46-47b5-af0a-957dffc45ef4'],
      tagIds: [],
    },
  ];
}
