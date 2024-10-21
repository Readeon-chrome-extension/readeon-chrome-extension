/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */
import { BaseStorage, createStorage, StorageType } from '@src/shared/storages/base';

type IsRequestHasFilterStorage = BaseStorage<boolean> & {
  add: (hasFilter: boolean) => Promise<void>;
};

const storage = createStorage<boolean>('is-request-has-filter-view-key', false, {
  storageType: StorageType.Local,
  liveUpdate: true,
});

const isRequestHasFilterStorage: IsRequestHasFilterStorage = {
  ...storage,
  add: async hasFilter => {
    await storage.set(hasFilter);
  },
};

export default isRequestHasFilterStorage;
