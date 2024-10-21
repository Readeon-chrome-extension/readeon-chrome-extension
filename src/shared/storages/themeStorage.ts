/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */
import { BaseStorage, createStorage, StorageType } from '@src/shared/storages/base';

type ThemeStorage = BaseStorage<string> & {
  setTheme: (theme: string) => Promise<void>;
  getTheme: () => Promise<string>;
};

const storage = createStorage<string>('global-theme-storage-key', 'light', {
  storageType: StorageType.Local,
  liveUpdate: true,
});

const themeStorage: ThemeStorage = {
  ...storage,
  setTheme: async (theme: string) => {
    await storage.set(() => theme);
  },
  getTheme: async () => {
    return await storage.get();
  },
};

export default themeStorage;
