/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */

import { BaseStorage, createStorage, StorageType } from '@src/shared/storages/base';

type CheckboxIdsStorage = BaseStorage<Record<string, string[]>> & {
  clear: (authorKey: string) => Promise<void>;
  addPostId: (authorKey: string, postId: string) => Promise<void>;
  addMultiplePostIds: (authorKey: string, postIds: string[]) => Promise<void>;
  removePostId: (authorKey: string, postId: string) => Promise<void>;
  removeMultiplePostIds: (authorKey: string) => Promise<void>;
};

const storage = createStorage<Record<string, string[]> | null>(
  'checkbox-ids-storage-key',
  {},
  {
    storageType: StorageType.Local,
    liveUpdate: true,
  },
);

const checkboxIdsStorage: CheckboxIdsStorage = {
  ...storage,
  clear: async authorKey => {
    await storage.set(value => {
      if (value && value[authorKey]) {
        delete value[authorKey];
      }
      return value;
    });
  },
  addPostId: async (authorKey, postId) => {
    await storage.set(prev => {
      if (!prev[authorKey]) {
        prev[authorKey] = [];
      }
      if (!prev[authorKey].includes(postId)) {
        prev[authorKey].push(postId);
      }
      return { ...prev };
    });
  },
  removePostId: async (authorKey, postId) => {
    await storage.set(prev => {
      if (prev[authorKey]) {
        prev[authorKey] = prev[authorKey].filter(id => id !== postId);
      }
      return { ...prev };
    });
  },
  addMultiplePostIds: async (authorKey, postIds) => {
    await storage.set(prev => {
      const currentIds = prev && prev[authorKey] ? [...prev[authorKey]] : [];
      postIds.forEach(postId => {
        if (!currentIds.includes(postId)) {
          currentIds.push(postId);
        }
      });
      return {
        ...prev,
        [authorKey]: currentIds,
      };
    });
  },
  removeMultiplePostIds: async authorKey => {
    await storage.set(prev => {
      if (!prev || !prev[authorKey]) {
        return prev;
      }
      // const updatedIds = prev[authorKey].filter(id => !postIds.includes(id));
      return {
        ...prev,
        [authorKey]: [],
      };
    });
  },
};

export default checkboxIdsStorage;
