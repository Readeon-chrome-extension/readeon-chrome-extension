/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */
import { BaseStorage, createStorage, StorageType } from '@src/shared/storages/base';

type IsLatestPostStorage = BaseStorage<boolean> & {
  add: (isLatest: boolean) => Promise<void>;
};

const storage = createStorage<boolean>('is-latest-post-storage-key', false, {
  storageType: StorageType.Local,
  liveUpdate: true,
});

const isLatestPostStorage: IsLatestPostStorage = {
  ...storage,
  add: async isLatest => {
    await storage.set(isLatest);
  },
};

export default isLatestPostStorage;
