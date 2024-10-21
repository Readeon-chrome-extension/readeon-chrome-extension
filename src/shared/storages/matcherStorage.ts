/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */
import { BaseStorage, createStorage, StorageType } from '@src/shared/storages/base';

type CurrentRoute = 'posts' | 'recentPosts' | 'creatorPost' | '';

type MatcherStorage = BaseStorage<CurrentRoute> & {
  match: (route: CurrentRoute) => Promise<void>;
};

const storage = createStorage<CurrentRoute>('matcher-storage-key', '', {
  storageType: StorageType.Local,
  liveUpdate: true,
});

const matcherStorage: MatcherStorage = {
  ...storage,
  match: async route => {
    await storage.set(() => route);
  },
};

export default matcherStorage;
