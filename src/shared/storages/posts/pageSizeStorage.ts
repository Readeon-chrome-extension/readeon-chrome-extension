/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */
import { BaseStorage, createStorage, StorageType } from '@src/shared/storages/base';

type PageSizeStorage = BaseStorage<number> & {
  add: (pageSize: number) => Promise<void>;
};

const storage = createStorage<number>('post-page-size-storage-key', 10, {
  storageType: StorageType.Local,
  liveUpdate: true,
});

const pageSizeStorage: PageSizeStorage = {
  ...storage,
  add: async value => {
    await storage.set(value);
  },
};

export default pageSizeStorage;
