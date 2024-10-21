/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */
import { Post } from '@src/shared/storages/posts/postsStorage';
import { BaseStorage, createStorage, StorageType } from '@src/shared/storages/base';

export type RecentPostsStorage = BaseStorage<Post[]> & {
  clear: (key: string) => Promise<void>;
  clearAll: () => Promise<void>;
  add: (posts: Post[]) => Promise<void>;
  delete: () => Promise<void>;
};
const addIndex = (posts: Post[]) => {
  const finalArray = [];
  const indexTracker = {};
  posts.forEach(item => {
    const name = item.authorKey;
    if (!indexTracker[name]) {
      indexTracker[name] = 0;
    }
    finalArray.push({ ...item, index: indexTracker[name] });
    indexTracker[name]++;
  });
  return finalArray;
};

const storage = createStorage<Post[]>('recent-posts-storage-key', [], {
  storageType: StorageType.Local,
  liveUpdate: true,
});

const recentPostsStorage: RecentPostsStorage = {
  ...storage,
  clear: async key => {
    await storage.set(prev => {
      if (prev?.length) prev[key] = [];
      return prev;
    });
  },
  clearAll: async () => {
    await storage.set([]);
  },
  add: async posts => {
    const indexedPost = addIndex(posts);

    await storage.set(prev => {
      posts = indexedPost.filter(post => !prev?.some(prevPost => prevPost?.id === post?.id)) ?? [];
      return [...prev, ...posts];
    });
  },
  delete: async () => {
    await storage.set(null);
  },
};

export default recentPostsStorage;
