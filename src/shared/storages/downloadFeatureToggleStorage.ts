/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */

import { BaseStorage, createStorage, StorageType } from '@src/shared/storages/base';

type DownloadFeatureToggleStorageType = BaseStorage<Record<string, boolean>> & {
  setHasClicked: (authorKey: string, viewType: string, value: boolean) => Promise<void>;
  hasClicked: (authorKey: string, viewType: string) => Promise<boolean>;
};

const STORAGE_KEY = 'download-feature-toggle-storage-key';

const storage = createStorage<Record<string, boolean>>(
  STORAGE_KEY,
  {},
  {
    storageType: StorageType.Local,
    liveUpdate: true,
  },
);

export const getStorageKey = (authorKey: string, viewType: string) => `${authorKey}-${viewType}`;

const downloadFeatureToggleStorage: DownloadFeatureToggleStorageType = {
  ...storage,
  setHasClicked: async (authorKey: string, viewType: string, value: boolean) => {
    const key = getStorageKey(authorKey, viewType);
    const data = await storage.get();
    data[key] = value;
    await storage.set(() => data);
  },
  hasClicked: async (authorKey: string, viewType: string) => {
    const key = getStorageKey(authorKey, viewType);
    const data = await storage.get();
    return data[key] ?? false;
  },
};

export default downloadFeatureToggleStorage;
