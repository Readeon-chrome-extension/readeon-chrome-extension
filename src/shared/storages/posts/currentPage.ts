/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */

import { BaseStorage, createStorage, StorageType } from '@src/shared/storages/base';

type PostCurrentPage = {
  [key: string]: {
    currentPage: number;
  };
};

export type CurrentPage = BaseStorage<PostCurrentPage> & {
  clear: (key: string) => Promise<void>;
  setCurrentPage: (key: string, page: number) => Promise<void>;
};
const storage = createStorage<PostCurrentPage>(
  'posts-current-page-storage-key',
  {},
  {
    storageType: StorageType.Local,
    liveUpdate: true,
  },
);

const currentPageStorage: CurrentPage = {
  ...storage,
  clear: async key => {
    await storage.set(value => {
      if (value && value[key]) {
        delete value[key];
      }
      return value;
    });
  },
  setCurrentPage: async (key, page) => {
    await storage.set(prev => {
      return {
        ...prev,
        [key]: {
          ...prev[key],
          currentPage: page,
        },
      };
    });
  },
};
export default currentPageStorage;
