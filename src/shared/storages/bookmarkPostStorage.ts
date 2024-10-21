/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */

import { BaseStorage, createStorage, StorageType } from '@src/shared/storages/base';
import { Post } from './posts/postsStorage';

type BookmarkPostsStorage = BaseStorage<Record<string, Post>> & {
  clear: (key: string) => Promise<void>;
  add: (authorKey: string, post: Post) => Promise<void>;
};

const storage = createStorage<Record<string, Post> | null>(
  'bookmark-posts-storage-key',
  {},
  {
    storageType: StorageType.Local,
    liveUpdate: true,
  },
);

const bookmarkPostsStorage: BookmarkPostsStorage = {
  ...storage,
  clear: async key => {
    await storage.set(value => {
      if (value && value[key]) {
        delete value[key];
      }
      return value;
    });
  },
  add: async (authorKey, post) => {
    await storage.set(prev => {
      if (!prev[authorKey]) {
        return {
          ...prev,
          [authorKey]: post,
        };
      }
      return {
        ...prev,
        [authorKey]: post,
      };
    });
  },
};

export default bookmarkPostsStorage;
