/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */
import { BaseStorage, createStorage, StorageType } from '@src/shared/storages/base';

type IsBookMarkViewStorage = BaseStorage<boolean> & {
  toggle: () => Promise<void>;
};

const storage = createStorage<boolean>('is-bookmark-view-key', false, {
  storageType: StorageType.Local,
  liveUpdate: true,
});

const isBookMarkViewStorage: IsBookMarkViewStorage = {
  ...storage,
  toggle: async () => {
    await storage.set(p => !p);
  },
};

export default isBookMarkViewStorage;
