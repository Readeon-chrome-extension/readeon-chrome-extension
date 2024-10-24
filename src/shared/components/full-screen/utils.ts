/* Copyright (C) [2024] [Readeon]
 This code is for viewing purposes only. Modification, redistribution, and commercial use are strictly prohibited 
 */
import config from '@root/src/config';
import { SelectorConfig } from '../../storages/configStorage';
import singlePostStorage from '../../storages/singlePostStorage';

let movedPoll: HTMLElement;
let movedPostDetails: HTMLElement;
let movedAttachments: HTMLElement;
let movedComments: HTMLElement;
let movedAudio: HTMLElement;
let movedVideo: HTMLElement;

export const movePollForAuthor = (itemIndex: number, isPinnedPost: boolean, dynamicConfig: SelectorConfig) => {
  if (isNaN(itemIndex) || movedPoll) {
    return;
  }
  const rootSelector = dynamicConfig?.postRootSelector;
  const rootPostElement = document.querySelector(
    isPinnedPost ? dynamicConfig?.pinnedPostRootSelector : `${rootSelector}:nth-child(${itemIndex + 1})`,
  );

  if (!rootPostElement) {
    return;
  }
  pollSelected(rootPostElement);
};
export const pollSelected = (rootPostElement: Element) => {
  const polls = rootPostElement.querySelector(config.pages.posts.pollSelector);

  const pollsContainer = document.querySelector('.full-screen__poll');
  if (polls && pollsContainer) {
    clearPolls();
    pollsContainer?.appendChild(polls);
    movedPoll = polls as HTMLElement;
  }
};
export const pollSelectedRecentView = (rootPostElement: Element) => {
  const polls = rootPostElement.querySelector(config.pages.recentPosts.pollSelector);
  const pollsContainer = document.querySelector('.full-screen__poll');
  if (polls && pollsContainer) {
    clearPolls();
    pollsContainer?.appendChild(polls);
    movedPoll = polls as HTMLElement;
  }
};
//restoring the polls element in author view
export const restorePollsAuthorView = (itemIndex: number, isPinnedPost: boolean, dynamicConfig: SelectorConfig) => {
  if (isNaN(itemIndex) || !movedPoll) {
    return;
  }
  const rootSelector = dynamicConfig.postRootSelector;
  const root = document.querySelector(
    `${isPinnedPost ? dynamicConfig.pinnedPostRootSelector : `${rootSelector}:nth-child(${itemIndex + 1})`} ${config.pages.posts.restorePoll}`,
  );
  if (!root) {
    return;
  }
  root.insertAdjacentElement('afterend', movedPoll);
  movedPoll = null;
};
//restore the polls element in recent view
export const restorePollsRecentView = (authorKey: string, itemIndex: number) => {
  if (!authorKey || !movedPoll) {
    return;
  }
  const selectedPosts = selectedAuthorRecentPost(authorKey);

  if (selectedPosts?.length) {
    const element = selectedPosts[itemIndex];
    if (!element) return;

    const root = element?.querySelector(config.pages.recentPosts.restorePoll);
    if (!root) {
      return;
    }
    root.appendChild(movedPoll);
    movedPoll = null;
  }
};
export const clearPolls = () => {
  document.querySelector('.full-screen__poll').innerHTML = '';
};

export const pollsForRecentView = (authorKey: string, itemIndex: number) => {
  if (!authorKey || isNaN(itemIndex)) {
    return;
  }

  const selectedPosts = selectedAuthorRecentPost(authorKey);
  if (selectedPosts?.length) {
    const element = selectedPosts[itemIndex];
    if (!element) return;

    pollSelectedRecentView(element);
  }
};

//post actions recent view
//select the author for recent view by authorKey
export const selectedAuthorRecentPost = (authorKey: string) => {
  const authorSelector = `[href="${authorKey}"][aria-label="Visit page"]`;
  const selectedAuthor = document.querySelector(authorSelector);
  const targetElement = selectedAuthor?.closest(config.pages.recentPosts.rootAuthorSelector);
  const selectedPosts = targetElement?.querySelectorAll(config.pages.recentPosts.postSelector);
  return selectedPosts ?? [];
};

export const authorRecentPost = (
  authorKey: string,
  itemIndex: number,
  isComment: boolean,
  isAudio?: boolean,
  isVideo?: boolean,
  hasLink?: boolean,
) => {
  if (!authorKey || isNaN(itemIndex)) {
    return;
  }
  //getting all the posts details for selected author in recent view
  const selectedPosts = selectedAuthorRecentPost(authorKey);
  if (selectedPosts?.length) {
    const element = selectedPosts[itemIndex];
    if (!element) return;

    isComment ? commentSelected(element) : selectedPostActions(element);
    isAudio && selectAudioRecentView(element);
    (isVideo || hasLink) && selectVideoRecentView(element, hasLink);
  }
};

//getting the selected post actions details for author
const selectedPostActions = (rootPostElement: Element) => {
  const postDetailsSelector = config.pages.posts.postDetailsSelector;

  if (!rootPostElement) {
    return;
  }
  const actions = rootPostElement.querySelector(postDetailsSelector);

  const postDetailActionContainer = document.querySelector('.full-screen__post-details-actions');
  if (actions && postDetailActionContainer) {
    clearPostDetailsActions();
    postDetailActionContainer.appendChild(actions);
    movedPostDetails = actions as HTMLElement;
    // actions.remove()
  }
};
const clearPostDetailsActions = () => {
  document.querySelector('.full-screen__post-details-actions').innerHTML = '';
};
const clearAttachments = () => {
  document.querySelector('.full-screen__attachments').innerHTML = '';
};
//move the post actions for author view
export const movePostDetails = (itemIndex: number, isPinnedPost: boolean, dynamicConfig: SelectorConfig) => {
  if (isNaN(itemIndex) || movedPostDetails) {
    return;
  }

  const rootSelector = dynamicConfig?.postRootSelector;

  const rootPostElement = document.querySelector(
    isPinnedPost ? dynamicConfig?.pinnedPostRootSelector : `${rootSelector}:nth-child(${itemIndex + 1})`,
  );
  if (!rootPostElement) {
    return;
  }

  selectedPostActions(rootPostElement);
  selectAttachments(rootPostElement);
};
const selectAttachments = (rootPostElement: Element) => {
  if (!rootPostElement) {
    return;
  }

  const attachments = rootPostElement.querySelector(config?.pages?.posts?.attachmentSelector);
  const attachmentsContainer = document.querySelector('.full-screen__attachments');
  if (attachments && attachmentsContainer) {
    clearAttachments();
    attachmentsContainer.appendChild(attachments);
    movedAttachments = attachments as HTMLElement;
  }
};

export const restoreAttachmentsAuthorView = (
  itemIndex: number,
  isPinnedPost: boolean,
  dynamicConfig: SelectorConfig,
) => {
  if (isNaN(itemIndex) || !movedAttachments) {
    return;
  }
  const rootSelector = dynamicConfig?.postRootSelector;
  const root = document.querySelector(
    `${isPinnedPost ? dynamicConfig?.pinnedPostRootSelector : `${rootSelector}:nth-child(${itemIndex + 1})`} ${config.pages.posts.restoreAttachments}`,
  );
  if (!root) {
    return;
  }
  root.appendChild(movedAttachments);
  movedAttachments = null;
};
//Restore the post actions details for author view
export const restorePostActionsAuthorView = (
  itemIndex: number,
  isPoll: boolean,
  isView: boolean,
  hasTag: boolean,
  isPinnedPost: boolean,
  dynamicConfig: SelectorConfig,
) => {
  if (isNaN(itemIndex) || !movedPostDetails) {
    return;
  }

  const rootSelector = dynamicConfig?.postRootSelector;
  const root = document.querySelector(
    `${isPinnedPost ? dynamicConfig?.pinnedPostRootSelector : `${rootSelector}:nth-child(${itemIndex + 1})`} ${config.pages.posts.restorePostDetailsSelector} > div:nth-child(${isPoll || !isView || hasTag ? 3 : 2})`,
  );

  if (!root) {
    return;
  }

  root.appendChild(movedPostDetails);
  movedPostDetails = null;
};
//Restore the post actions details for recent  view
export const restorePostActionsRecentView = (authorKey: string, itemIndex: number, isView: boolean) => {
  if (!authorKey || !movedPostDetails) {
    return;
  }
  const selectedPosts = selectedAuthorRecentPost(authorKey);
  if (selectedPosts?.length) {
    const element = selectedPosts[itemIndex];
    if (!element) return;

    const root = element?.querySelector(
      isView ? config.pages.recentPosts.restorePostDetailsSelector : `[elevation="subtle"] > div:last-child > div`,
    );

    if (!root) {
      return;
    }
    root.appendChild(movedPostDetails);
    movedPostDetails = null;
  }
};

export const removeSubscriptionNode = async () => {
  const singlePost = await singlePostStorage.get();
  const isAuthorJoinPage = document.querySelector('[data-tag="join-for-free-button"]');
  const isSubscriptionNode = document?.querySelector(`${config.pages.posts.subscriptionNodeSelector}`);

  if (isAuthorJoinPage || (singlePost?.href === window?.location?.pathname && singlePost?.isSinglePostView)) return;

  if (isSubscriptionNode?.parentElement) {
    isSubscriptionNode?.parentElement?.remove();
  }
};
export const handleScrollUp = () => {
  const id = document.getElementById('scroll-up') as HTMLElement;
  id.scrollIntoView({ behavior: 'smooth' });
};

export const pauseAudioFile = () => {
  const targetElement = document.querySelector('.full-screen__audio');
  const audioFile = targetElement?.querySelector('[data-tag="audio-player"]') as HTMLAudioElement;

  audioFile?.pause();
};

//move the comment for author view
export const moveCommentsAuthor = (itemIndex: number, isPinnedPost: boolean, dynamicConfig: SelectorConfig) => {
  if (isNaN(itemIndex) || movedComments) {
    return;
  }
  const rootSelector = dynamicConfig?.postRootSelector;
  const rootPostElement = document.querySelector(
    isPinnedPost ? dynamicConfig.pinnedPostRootSelector : `${rootSelector}:nth-child(${itemIndex + 1})`,
  );

  if (!rootPostElement) {
    return;
  }
  commentSelected(rootPostElement);
};

//get the selected comment for particular post
export const commentSelected = (rootPostElement: Element) => {
  const commentsSelector = config.pages.posts.commentsSelector;
  const comments = rootPostElement.querySelector(commentsSelector);
  const commentsContainer = document.querySelector('.full-screen__comments-content');

  if (comments && commentsContainer) {
    clearComments();
    commentsContainer.appendChild(comments);
    movedComments = comments as HTMLElement;
  }
};
//move the comments on actual location in dom fir author view
export const restoreComments = (itemIndex: number, isPinnedPost: boolean, dynamicConfig: SelectorConfig) => {
  if (isNaN(itemIndex) || !movedComments) {
    return;
  }
  const rootSelector = dynamicConfig?.postRootSelector;
  const root = document.querySelector(
    `${isPinnedPost ? dynamicConfig?.pinnedPostRootSelector : `${rootSelector}:nth-child(${itemIndex + 1})`} ${config.pages.posts.restoreCommentsSelector}`,
  );

  if (!root) {
    return;
  }
  console.log('root===', { root });

  root.appendChild(movedComments);
  movedComments = null;
};
//move the comments on actual location in dom fir recent view
export const restoreCommentsRecentView = (authorKey: string, itemIndex: number) => {
  if (!authorKey || !movedComments) {
    return;
  }
  const selectedPosts = selectedAuthorRecentPost(authorKey);
  if (selectedPosts?.length) {
    const element = selectedPosts[itemIndex];

    if (!element) return;

    const root = element.querySelector(config.pages.recentPosts.restoreCommentsSelector);
    if (!root) {
      return;
    }
    root.appendChild(movedComments);
    movedComments = null;
  }
};

export const moveAudio = (itemIndex: number, isPinnedPost: boolean, dynamicConfig: SelectorConfig) => {
  if (isNaN(itemIndex) || movedAudio) {
    return;
  }
  const rootSelector = dynamicConfig?.postRootSelector;

  const audioSelector = config.pages.posts.audioSelector;
  const rootPostElement = document.querySelector(
    isPinnedPost ? dynamicConfig.pinnedPostRootSelector : `${rootSelector}:nth-child(${itemIndex + 1})`,
  );
  const audio = rootPostElement.querySelector(audioSelector);
  if (audio) {
    clearAudio();
    document.querySelector('.full-screen__audio').appendChild(audio);
    movedAudio = audio as HTMLElement;
  }
};
export const selectAudioRecentView = (rootPostElement: Element) => {
  if (!rootPostElement) {
    return;
  }
  const audioSelector = config.pages.posts.audioSelector;
  const audio = rootPostElement.querySelector(audioSelector);

  const audioContainer = document.querySelector('.full-screen__audio');
  if (audio && audioContainer) {
    clearAudio();
    audioContainer?.appendChild(audio);
    movedAudio = audio as HTMLElement;
  }
};
export const restoreAudioRecentView = (authorKey: string, itemIndex: number) => {
  if (!authorKey || !movedAudio) {
    return;
  }
  const selectedPosts = selectedAuthorRecentPost(authorKey);
  selectedPosts?.forEach((element, idx) => {
    if (idx === itemIndex) {
      const root = element.querySelector(config.pages.posts.restoreAudioSelector);
      if (!root) {
        return;
      }
      root?.insertAdjacentElement('afterbegin', movedAudio);
      movedAudio = null;
    }
  });
};
export const restoreAudio = (itemIndex: number, isPinnedPost: boolean, dynamicConfig: SelectorConfig) => {
  if (isNaN(itemIndex) || !movedAudio) {
    return;
  }
  const rootSelector = dynamicConfig?.postRootSelector;
  const root = document.querySelector(
    `${isPinnedPost ? dynamicConfig?.pinnedPostRootSelector : `${rootSelector}:nth-child(${itemIndex + 1})`} ${config.pages.posts.restoreAudioSelector}`,
  );
  if (!root) {
    return;
  }

  root?.insertAdjacentElement('afterbegin', movedAudio);
  movedAudio = null;
};

const clearComments = () => {
  document.querySelector('.full-screen__comments-content').innerHTML = '';
};

const clearAudio = () => {
  document.querySelector('.full-screen__audio').innerHTML = '';
};
const clearVideo = () => {
  document.querySelector('.full-screen__video').innerHTML = '';
};
export const moveVideo = (
  itemIndex: number,
  isPinnedPost: boolean,
  dynamicConfig: SelectorConfig,
  hasLink: boolean,
) => {
  if (isNaN(itemIndex) || movedVideo) {
    return;
  }
  const rootSelector = dynamicConfig?.postRootSelector;
  const videoSelector = hasLink ? config.pages.posts.linkSelector : config.pages.posts.videoSelector;
  const rootPostElement = document.querySelector(
    isPinnedPost ? dynamicConfig.pinnedPostRootSelector : `${rootSelector}:nth-child(${itemIndex + 1})`,
  );

  if (!rootPostElement) return;

  const video = rootPostElement.querySelector(videoSelector);

  if (video) {
    clearVideo();
    document.querySelector('.full-screen__video').appendChild(video);
    movedVideo = video as HTMLElement;
  }
};

export const selectVideoRecentView = (rootPostElement: Element, hasLink: boolean) => {
  if (!rootPostElement) {
    return;
  }
  const videoSelector = hasLink ? config.pages.recentPosts.linkSelector : config.pages.posts.videoSelector;
  const video = rootPostElement.querySelector(videoSelector);

  const videoContainer = document.querySelector('.full-screen__video');
  if (video && videoContainer) {
    clearVideo();
    videoContainer?.appendChild(video);
    movedVideo = video as HTMLElement;
  }
};

export const restoreVideo = (
  itemIndex: number,
  isPinnedPost: boolean,
  dynamicConfig: SelectorConfig,
  hasLink: boolean,
) => {
  if (isNaN(itemIndex) || !movedVideo) {
    return;
  }
  const rootSelector = dynamicConfig?.postRootSelector;
  const root = document.querySelector(
    `${isPinnedPost ? dynamicConfig?.pinnedPostRootSelector : `${rootSelector}:nth-child(${itemIndex + 1})`} ${hasLink ? config.pages.posts.restoreLinkSelector : config.pages.posts.restoreVideoSelector}`,
  );
  if (!root) {
    return;
  }

  root?.insertAdjacentElement('afterbegin', movedVideo);
  movedVideo = null;
};
export const restoreVideoRecentView = (authorKey: string, itemIndex: number, hasLink: boolean) => {
  if (!authorKey || !movedVideo) {
    return;
  }
  const selectedPosts = selectedAuthorRecentPost(authorKey);
  if (selectedPosts?.length) {
    const element = selectedPosts[itemIndex];

    if (!element) return;

    const root = element.querySelector(
      hasLink ? config.pages.recentPosts.restoreLinkSelector : config.pages.posts.restoreVideoSelector,
    );
    if (!root) {
      return;
    }
    root?.insertAdjacentElement('afterbegin', movedVideo);
    movedVideo = null;
  }
};
export const pauseVideoFile = () => {
  const targetElement = document.querySelector('.full-screen__video');
  const videoFile = targetElement?.querySelector(config.pages.posts.videoTagSelector) as HTMLAudioElement;
  videoFile?.pause();
};
