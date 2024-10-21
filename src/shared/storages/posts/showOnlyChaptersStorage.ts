/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */
import { BaseStorage, createStorage, StorageType } from '@src/shared/storages/base';

export type ShowOnlyChaptersStorage = BaseStorage<boolean> & {
  toggle: () => Promise<void>;
};

const storage = createStorage('show-only-chapters-storage-key', false, {
  storageType: StorageType.Local,
  liveUpdate: true,
});

const showOnlyChaptersStorage: ShowOnlyChaptersStorage = {
  ...storage,
  toggle: async () => {
    await storage.set(isEnable => {
      return !isEnable;
    });
  },
};

export default showOnlyChaptersStorage;
