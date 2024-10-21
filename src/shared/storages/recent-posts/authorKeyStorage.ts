/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */
import { BaseStorage, createStorage, StorageType } from '@src/shared/storages/base';

type AuthorKeyStorage = BaseStorage<string> & {
  clear: () => Promise<void>;
  add: (authorKey: string) => Promise<void>;
};

const storage = createStorage<string | null>('bookmark-posts-author-storage-key', null, {
  storageType: StorageType.Local,
  liveUpdate: true,
});

const authorKeyStorage: AuthorKeyStorage = {
  ...storage,
  clear: async () => {
    await storage.set(null);
  },
  add: async (key: string) => {
    await storage.set(key);
  },
};

export default authorKeyStorage;
