/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */
import { BaseStorage, createStorage, StorageType } from '@src/shared/storages/base';

type VisitedPostsStorage = BaseStorage<number[]> & {
  clear: () => Promise<void>;
  add: (postId: number) => Promise<void>;
};

const storage = createStorage<number[]>('visited-posts-storage-key', [], {
  storageType: StorageType.Local,
  liveUpdate: true,
});

const visitedPostsStorage: VisitedPostsStorage = {
  ...storage,
  clear: async () => {
    await storage.set(() => []);
  },
  add: async postId => {
    await storage.set(prev => {
      if (prev.includes(postId)) {
        return prev;
      }
      return [...prev, postId];
    });
  },
};

export default visitedPostsStorage;
