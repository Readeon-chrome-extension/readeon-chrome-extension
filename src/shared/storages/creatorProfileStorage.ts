/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */

import { BaseStorage, createStorage, StorageType } from '@src/shared/storages/base';
import { UserProfile } from './posts/postsStorage';

interface createProfile {
  [key: string]: UserProfile;
}
type CreatorProfileStorage = BaseStorage<createProfile> & {
  add: (creatorProfile: UserProfile, key: string) => Promise<void>;
};

const storage = createStorage<createProfile>('creator-profile-storage-key', null, {
  storageType: StorageType.Local,
  liveUpdate: true,
});

const creatorProfileStorage: CreatorProfileStorage = {
  ...storage,
  add: async (creatorProfile, key) => {
    await storage.set(prev => ({ ...prev, [key]: creatorProfile }));
  },
};

export default creatorProfileStorage;
