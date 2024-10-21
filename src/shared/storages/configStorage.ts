/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */

import { BaseStorage, createStorage, StorageType } from '@src/shared/storages/base';
export type SelectorConfig = {
  postsSelector: string;
  postRootSelector: string;
  loadMoreButtonText: string;
  pinnedPostRootSelector: string;
  postTitleSelector: string;
  postTitleAnchorElement: string;
  creatorNameSelector: string;
};
type DynamicSelectorConfig = BaseStorage<SelectorConfig> & {
  add: (value: SelectorConfig) => Promise<void>;
};

const storage = createStorage<SelectorConfig>(
  'dynamic-selector-post-view-key',
  {
    pinnedPostRootSelector: '',
    postRootSelector: '',
    loadMoreButtonText: '',
    postsSelector: '',
    postTitleSelector: '',
    postTitleAnchorElement: '',
    creatorNameSelector: '',
  },
  {
    storageType: StorageType.Local,
    liveUpdate: true,
  },
);

const dynamicSelectorStorage: DynamicSelectorConfig = {
  ...storage,
  add: async value => {
    await storage.set(value);
  },
};

export default dynamicSelectorStorage;
