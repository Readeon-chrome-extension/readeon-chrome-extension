/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */

import { BaseStorage, createStorage, StorageType } from '@src/shared/storages/base';
import { UserProfile } from './posts/postsStorage';

type CreatorProfileStorage = BaseStorage<UserProfile> & {
  add: (creatorProfile: UserProfile) => Promise<void>;
};

const storage = createStorage<UserProfile>('creator-profile-storage-key', null, {
  storageType: StorageType.Local,
  liveUpdate: true,
});

const creatorProfileStorage: CreatorProfileStorage = {
  ...storage,
  add: async creatorProfile => {
    await storage.set(creatorProfile);
  },
};

export default creatorProfileStorage;
