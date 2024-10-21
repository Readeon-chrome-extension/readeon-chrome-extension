/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */
import { BaseStorage, createStorage, StorageType } from '@src/shared/storages/base';

export type SelectedPostAuthorStorage = BaseStorage<number> & {
  clear: () => Promise<void>;
  set: (value: number) => Promise<void>;
};

const storage = createStorage<number>('selected-posts-author-storage-key', null, {
  storageType: StorageType.Local,
  liveUpdate: true,
});

const selectedPostAuthorStorage: SelectedPostAuthorStorage = {
  ...storage,
  clear: async () => {
    await storage.set(null);
  },
  set: async (value: number) => {
    await storage.set(value);
  },
};

export default selectedPostAuthorStorage;
