/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */
import { BaseStorage, createStorage, StorageType } from '@src/shared/storages/base';
import { Post } from './posts/postsStorage';

type IPinnedPostStorage = BaseStorage<Record<string, Post[]>> & {
  add: (authorKey: string, post: Post[]) => Promise<void>;
};

const storage = createStorage<Record<string, Post[]>>(
  'pinned-post-view-key',
  {},
  {
    storageType: StorageType.Local,
    liveUpdate: true,
  },
);

const pinnedPostStorage: IPinnedPostStorage = {
  ...storage,
  add: async (authorKey, post) => {
    await storage.set(prev => {
      const indexAdded = post?.map((item, index) => ({ ...item, index }));
      if (!prev[authorKey]) {
        return {
          ...prev,
          [authorKey]: indexAdded,
        };
      }
      return {
        ...prev,
        [authorKey]: indexAdded,
      };
    });
  },
};

export default pinnedPostStorage;
