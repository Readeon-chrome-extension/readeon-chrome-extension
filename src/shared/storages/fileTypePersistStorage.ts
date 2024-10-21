/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */
import { BaseStorage, createStorage, StorageType } from '@src/shared/storages/base';

type PersistFileTypeStorage = BaseStorage<string> & {
  setExtensionType: (type: string) => Promise<void>;
  getExtensionType: () => Promise<string>;
};

const storage = createStorage<string>('global-extension-type-storage-key', '', {
  storageType: StorageType.Local,
  liveUpdate: true,
});

const fileTypeStorage: PersistFileTypeStorage = {
  ...storage,
  setExtensionType: async (type: string) => {
    await storage.set(() => type);
  },
  getExtensionType: async () => {
    return await storage.get();
  },
};

export default fileTypeStorage;
