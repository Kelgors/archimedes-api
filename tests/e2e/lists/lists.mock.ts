import { Visibility } from '../../../src/models/ListVisibility';
import type { ListOutput } from '../../../src/schemas/List';

export function listPrivatePrivate(): ListOutput {
  return {
    id: '4e7f6619-2bd8-4e1a-ae0b-a56428eb4006',
    name: 'ins(PRIVATE),ano(PRIVATE)',
    description:
      'a5f5b94c-2d38-4a86-afdb-f99c61fdd4fb\n25c6ccf7-b41e-45c0-9184-916417bb988a\n07209d96-13be-4b86-8a74-8a0391e945fe',
    visibility: {
      instance: Visibility.PRIVATE,
      anonymous: Visibility.PRIVATE,
    },
    ownerId: '56878523-b447-4e8b-aa71-f614480900d7',
  };
}

export function listPrivateShared(): ListOutput {
  return {
    id: 'e2972c77-710e-4875-891d-1b73756f3fc5',
    name: 'ins(PRIVATE),ano(SHARED)',
    description:
      'bf7f6b2f-00cb-40b1-928b-0a133b4d2666\naa2d8127-cf10-45f8-ad9e-a3c0f42e5251\n5e6b5405-fece-46a1-83df-5a2c3ba5d63e',
    visibility: {
      instance: Visibility.PRIVATE,
      anonymous: Visibility.SHARED,
    },
    ownerId: '56878523-b447-4e8b-aa71-f614480900d7',
  };
}

export function listPrivatePublic(): ListOutput {
  return {
    id: '25895fa6-b1e4-4968-8ab1-f2b636dafc75',
    name: 'ins(PRIVATE),ano(PUBLIC)',
    description:
      'ef1b8543-317f-492b-9cce-196e3c3ecda9\n450b0d62-cfe8-4672-ab8a-062123b26588\neb5f9ec2-6d6d-4dc1-bbc3-717b5cc5eceb',
    visibility: {
      instance: Visibility.PRIVATE,
      anonymous: Visibility.PUBLIC,
    },
    ownerId: '56878523-b447-4e8b-aa71-f614480900d7',
  };
}

export function listSharedPrivate(): ListOutput {
  return {
    id: 'e1ad14e6-f189-47d1-989a-34723b6dccb4',
    name: 'ins(SHARED),ano(PRIVATE)',
    description:
      'c860a2b1-b1c5-4ccb-a756-1a07b4297daf\n3acfc8d0-7141-42e5-bbbd-9610649f7d9d\n093e42d8-fa58-4c31-9343-7ffee697f1be',
    visibility: {
      instance: Visibility.SHARED,
      anonymous: Visibility.PRIVATE,
    },
    ownerId: '56878523-b447-4e8b-aa71-f614480900d7',
  };
}

export function listSharedShared(): ListOutput {
  return {
    id: '82908b29-7f52-4065-8248-74320f356e29',
    name: 'ins(SHARED),ano(SHARED)',
    description:
      'd88bf899-ae63-414a-85dd-1acbc783c2f4\n267731ae-6e7b-4e5a-9be9-08895978434e\n99808125-e482-4773-b4ff-0eacfc8139fd',
    visibility: {
      instance: Visibility.SHARED,
      anonymous: Visibility.SHARED,
    },
    ownerId: '56878523-b447-4e8b-aa71-f614480900d7',
  };
}

export function listSharedPublic(): ListOutput {
  return {
    id: '22b6d444-2dae-4f55-967d-1e5bdeb91116',
    name: 'ins(SHARED),ano(PUBLIC)',
    description:
      '2f65cc84-a5de-4a7b-8cad-66794407f14b\n4d39404c-d480-45af-969a-87c822bdecf2\n12e03d6b-dfa1-46b2-8e67-6fcd7f53a52d',
    visibility: {
      instance: Visibility.SHARED,
      anonymous: Visibility.PUBLIC,
    },
    ownerId: '56878523-b447-4e8b-aa71-f614480900d7',
  };
}

export function listPublicPrivate(): ListOutput {
  return {
    id: '09c67eb5-2910-4753-9bc6-7d7ab337f54b',
    name: 'ins(PUBLIC),ano(PRIVATE)',
    description:
      'ffe3b03d-9735-4b20-a5b1-afbb4e41a5f6\n8b3bface-445c-44ba-9e58-7b216b556d33\nd70bc8df-b66f-490e-9363-71656911432a',
    visibility: {
      instance: Visibility.PUBLIC,
      anonymous: Visibility.PRIVATE,
    },
    ownerId: '56878523-b447-4e8b-aa71-f614480900d7',
  };
}

export function listPublicShared(): ListOutput {
  return {
    id: '30a022e2-ee4e-4e73-a9c0-3571027dafdb',
    name: 'ins(PUBLIC),ano(SHARED)',
    description:
      'e28a5ccf-3a32-4b8d-bf04-a972c83e26ff\n687b4f6e-8323-47a6-8b88-283ec6e4e455\n54101d20-3fe6-41ec-863e-a1b1e471f18c',
    visibility: {
      instance: Visibility.PUBLIC,
      anonymous: Visibility.SHARED,
    },
    ownerId: '56878523-b447-4e8b-aa71-f614480900d7',
  };
}

export function listPublicPublic(): ListOutput {
  return {
    id: 'ae98b1e8-7f46-47b5-af0a-957dffc45ef4',
    name: 'ins(PUBLIC),ano(PUBLIC)',
    description:
      'bf41d1f0-90b2-42e6-bef7-2e5f2501fd28\n0adc10af-a280-4dd4-9870-a82bbd5aa803\nbf919124-aaf1-41bd-9219-239190859990',
    visibility: {
      instance: Visibility.PUBLIC,
      anonymous: Visibility.PUBLIC,
    },
    ownerId: '56878523-b447-4e8b-aa71-f614480900d7',
  };
}
