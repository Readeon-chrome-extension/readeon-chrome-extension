/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */
import { BaseStorage, createStorage, StorageType } from '@src/shared/storages/base';

type SinglePostStorage = {
  href: string;
  isSinglePostView: boolean;
  isReloaded: boolean;
  isValidPost: boolean;
};
type SinglePostViewStorage = BaseStorage<SinglePostStorage> & {
  add: (href: string, isSinglePostView: boolean, isReloaded: boolean, isValidPost: boolean) => Promise<void>;
};

const storage = createStorage<SinglePostStorage>('is-single-post-view-key', null, {
  storageType: StorageType.Local,
  liveUpdate: true,
});

const singlePostStorage: SinglePostViewStorage = {
  ...storage,
  add: async (href, isSinglePostView, isReloaded, isValidPost) => {
    await storage.set({ href, isSinglePostView, isReloaded, isValidPost });
  },
};

export default singlePostStorage;
