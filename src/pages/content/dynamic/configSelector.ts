/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */

import dynamicSelectorStorage, { SelectorConfig } from '@src/shared/storages/configStorage';
import singlePostStorage from '@src/shared/storages/singlePostStorage';

import refreshOnUpdate from 'virtual:reload-on-update-in-view';

refreshOnUpdate('pages/content/dynamic/configSelector');

export const creatorPublicPage = '[data-tag="creator-public-page-recent-posts"]';
export const isUnjoinedAuthor = '[data-tag="age-gate-blur"]';
const isCreator = '[aria-label="Create post"]';
const getRootSelectorValue = () => {
  const isCreatorPublicPage = document && document?.querySelector(creatorPublicPage);
  const isUnjoinedAuthorPage = document && document.querySelector(isUnjoinedAuthor);
  if (isCreatorPublicPage || isUnjoinedAuthorPage) {
    return '[data-tag="all-posts-layout"]';
  } else {
    return 'div[spacing="separated"][data-cardlayout-edgeless].ganXF';
  }
};
const getPostRootSelector = () => {
  const isCreatorPublicPage = document && document?.querySelector(creatorPublicPage);
  const isUnjoinedAuthorPage = document && document.querySelector(isUnjoinedAuthor);
  if (isCreatorPublicPage || isUnjoinedAuthorPage) {
    return '[data-tag="all-posts-layout"] > div';
  } else {
    return '[spacing="separated"][data-cardlayout-edgeless].ganXF > div';
  }
};
const getLoadMoreSelector = () => {
  const isCreatorPublicPage = document && document?.querySelector(creatorPublicPage);
  const isUnjoinedAuthorPage = document && document.querySelector(isUnjoinedAuthor);
  if (isCreatorPublicPage || isUnjoinedAuthorPage) {
    return 'See more posts';
  } else {
    return 'Load more';
  }
};

const getPinnedPostRoot = async () => {
  const singlePost = await singlePostStorage?.get();
  if (singlePost?.href === window?.location?.pathname && singlePost?.isSinglePostView) {
    return `#renderPageContentWrapper [span="2"] div[data-tag="post-card"]`;
  } else {
    return '[data-tag="post-stream-container"] > div:last-child > div [data-tag="post-card"]';
  }
};
const getCreatorName = () => {
  const isCreatorPublicPage = document && document?.querySelector(creatorPublicPage);
  const isCreatorPage = document && document?.querySelector(isCreator);
  const isUnjoinedAuthorPage = document && document.querySelector(isUnjoinedAuthor);
  if (isCreatorPublicPage || isUnjoinedAuthorPage) {
    return '[data-tag="creator-public-page-cover"]';
  } else if (isCreatorPage) {
    return '[data-tag="brand-color-popover-button-style"]';
  } else {
    return '#pageheader-title';
    // return '#pageheader-title';
  }
};
const createDynamicConfig = async () => {
  const pinnedSelector = await getPinnedPostRoot();

  const config: SelectorConfig = {
    postsSelector: getRootSelectorValue(),
    postRootSelector: getPostRootSelector(),
    loadMoreButtonText: getLoadMoreSelector(),
    pinnedPostRootSelector: pinnedSelector,
    postTitleSelector: '[data-tag="post-title"]',
    postTitleAnchorElement: '[data-tag="post-title"] > a',
    creatorNameSelector: getCreatorName(),
  };
  dynamicSelectorStorage.add(config).then();
};

document.addEventListener('DOMContentLoaded', async () => {
  const selector = await dynamicSelectorStorage.get();
  const creatorNameSelector = getCreatorName();
  await dynamicSelectorStorage.add({ ...selector, creatorNameSelector: creatorNameSelector });
});
createDynamicConfig();
