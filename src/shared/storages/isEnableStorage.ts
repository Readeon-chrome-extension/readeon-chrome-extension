/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */
import { BaseStorage, createStorage, StorageType } from '@src/shared/storages/base';

type IsEnableStorage = BaseStorage<boolean> & {
  toggle: () => Promise<void>;
};

const storage = createStorage<boolean>('is-enable-storage-key', false, {
  storageType: StorageType.Local,
  liveUpdate: true,
});

const isEnableStorage: IsEnableStorage = {
  ...storage,
  toggle: async () => {
    await storage.set(isEnable => {
      return !isEnable;
    });
  },
};

export default isEnableStorage;
